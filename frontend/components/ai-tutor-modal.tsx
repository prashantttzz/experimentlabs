"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  XMarkIcon,
  PaperAirplaneIcon,
  CheckBadgeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import io, { Socket } from "socket.io-client";
import ReactMarkdown from "react-markdown";
import { Loader } from "lucide-react";
import { useAssessChunk, useGetChatHistory } from "@/queries";
import { AssessmentFeedbackToast } from "./assisment-feedback";

interface Message {
  id: number | string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  createdAt?: string; // from DB
}

interface AITutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleTitle?: string;
  goalId: string;
  chunkId: string;
  goalTitle?: string;
}

// --- COMPONENT ---
export function AITutorModal({
  isOpen,
  chunkId,
  goalId,
  onClose,
  moduleTitle,
  goalTitle,
}: AITutorModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    mutate: assessChunk,
    isPending: isAssessing,
  } = useAssessChunk(goalId, chunkId);
  const {
    data: initialHistory,
    isLoading: isLoadingHistory,
    isError: isHistoryError,
    refetch: refetchHistory,
  } = useGetChatHistory(goalId, chunkId, isOpen);

  useEffect(() => {
    if (isOpen) {
      const socket = io(
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000"
      );
      socketRef.current = socket;

      socket.on("connect", () => setIsConnected(true));
      socket.on("disconnect", () => setIsConnected(false));
      socket.on("connect_error", () =>
        toast.error("Connection failed. Please check your network.")
      );

      socket.on("receiveMessage", (aiMessage: Message) => {
        setMessages((prev) => [
          ...prev,
          { ...aiMessage, timestamp: new Date(aiMessage.timestamp) },
        ]);
        setIsAiTyping(false);
      });

      socket.on("userMessageSaved", (savedUserMessage: Message) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === "optimistic-message"
              ? {
                  ...savedUserMessage,
                  timestamp: new Date(savedUserMessage.createdAt!),
                }
              : msg
          )
        );
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialHistory) {
      const formattedHistory = initialHistory.map((msg: any) => ({
        ...msg,
        id: msg.id,
        sender: msg.sender === "USER" ? "user" : "ai",
        timestamp: new Date(msg.createdAt),
      }));
      setMessages(formattedHistory);
    }
  }, [initialHistory]);

  // Effect for auto-scrolling
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(() => {
    if (
      !inputValue.trim() ||
      !socketRef.current?.connected ||
      isAssessing ||
      isAiTyping
    )
      return;

    const optimisticMessage: Message = {
      id: "optimistic-message",
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setIsAiTyping(true);

    const history = messages.map((msg) => ({
      role: msg.sender === "ai" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    socketRef.current.emit("sendMessage", {
      message: inputValue,
      moduleTitle,
      goalTitle,
      history,
      chunkId,
    });

    setInputValue("");
  }, [
    inputValue,
    messages,
    isAssessing,
    isAiTyping,
    chunkId,
    goalTitle,
    moduleTitle,
  ]);

  const handleRequestAssessment = useCallback(() => {
    const userMessagesCount = messages.filter(
      (m) => m.sender === "user"
    ).length;
    if (userMessagesCount < 1) {
      toast.info(
        "Please ask at least one question before requesting an assessment."
      );
      return;
    }
    assessChunk({ goalId, chunkId }, { onSuccess: onClose });
  }, [messages, assessChunk, goalId, chunkId, onClose]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  const isInputDisabled =
    isLoadingHistory || !isConnected || isAiTyping || isAssessing;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="flex h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="bg-green-100 text-sm font-semibold text-green-700">
                AI
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">AI Tutor</h3>
              <p className="text-sm text-gray-500">
                Helping with: {moduleTitle}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          {isLoadingHistory ? (
            <div className="flex h-full flex-col items-center justify-center text-gray-500">
              <Loader className="h-6 w-6 animate-spin" />
              <p className="mt-2">Loading conversation...</p>
            </div>
          ) : isHistoryError ? (
            <div className="flex h-full flex-col items-center justify-center text-red-500">
              <p>Failed to load chat history.</p>
              <Button
                onClick={() => refetchHistory()}
                variant="outline"
                className="mt-4"
              >
                <ArrowPathIcon className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <div className="text-center text-gray-400 pt-8">
                  No messages yet. Start the conversation!
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-end gap-2",
                    message.sender === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.sender === "ai" && (
                    <Avatar className="h-8 w-8 self-start">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-green-100 text-xs font-semibold text-green-700">
                        AI
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "prose max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed",
                      message.sender === "user"
                        ? "rounded-br-none bg-green-600 text-white prose-strong:text-white"
                        : "rounded-bl-none bg-gray-100 text-gray-800"
                    )}
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {isAiTyping && (
                <div className="flex items-end gap-2 justify-start">
                  <Avatar className="h-8 w-8 self-start">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-green-100 text-xs font-semibold text-green-700">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-[80%] rounded-2xl rounded-bl-none p-3 bg-gray-100">
                    <div className="flex items-center space-x-1.5">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={!isConnected ? "Connecting..." : "Ask a question..."}
              className="flex-1 rounded-full border-gray-300 bg-white focus:border-green-500 focus:ring-green-500/50"
              disabled={isInputDisabled}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isInputDisabled}
              size="icon"
              className="h-10 w-10 rounded-full bg-green-600 text-white hover:bg-green-700"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </Button>
          </div>
          <Button
            onClick={handleRequestAssessment}
            disabled={isInputDisabled}
            className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
          >
            <CheckBadgeIcon className="mr-2 h-5 w-5" />
            {isAssessing ? "Evaluating..." : "Request Assessment"}
          </Button>
        </div>
      </div>
    </div>
  );
}
