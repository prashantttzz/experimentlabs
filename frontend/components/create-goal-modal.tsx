"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  XMarkIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useCreateGoal } from "@/queries";
import { toast } from "sonner";
import { Loader } from "lucide-react";

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormErrors {
  goalDescription?: string;
  goalTitle?: string;
  timeline?: string;
}

export function CreateGoalModal({ isOpen, onClose }: CreateGoalModalProps) {
  const [step, setStep] = useState(1);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDescription, setGoalDescription] = useState("");
  const [selectedTimeline, setSelectedTimeline] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const { mutate, isPending, error } = useCreateGoal();

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!goalDescription.trim()) {
      newErrors.goalDescription = "Goal description is required";
    } else if (goalDescription.trim().length < 10) {
      newErrors.goalDescription =
        "Description should be at least 10 characters";
    } else if (goalDescription.trim().length > 500) {
      newErrors.goalDescription =
        "Description should not exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!goalTitle.trim()) {
      newErrors.goalTitle = "Goal title is required";
    } else if (goalTitle.trim().length < 3) {
      newErrors.goalTitle = "Title should be at least 3 characters";
    } else if (goalTitle.trim().length > 100) {
      newErrors.goalTitle = "Title should not exceed 100 characters";
    }

    if (!selectedTimeline) {
      newErrors.timeline = "Please select a timeline";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setErrors({});
      setStep(1);
    }
  };

  const handleCreateGoal = async () => {
    if (!validateStep2()) return;
    mutate(
      {
        title: goalTitle,
        description: goalDescription,
        timeline: selectedTimeline,
      },
      {
        onSuccess: () => {
          toast.success("goal created successfully.");
          onClose();
        },
        onError: () => {
          toast.error(error?.message||"error creating goal ");
        },
      }
    );
  };

  const ErrorMessage = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <div className="flex items-center space-x-2 text-red-400 text-sm mt-1">
        <ExclamationTriangleIcon className="w-4 h-4" />
        <span>{error}</span>
      </div>
    );
  };

  const getSuggestedTimeline = () => {
    const keywords = goalDescription.toLowerCase();
    if (
      keywords.includes("learn") &&
      (keywords.includes("language") || keywords.includes("programming"))
    ) {
      return "3-4 months";
    } else if (
      keywords.includes("certification") ||
      keywords.includes("exam")
    ) {
      return "2-3 months";
    } else if (keywords.includes("project") || keywords.includes("build")) {
      return "1-2 months";
    } else if (keywords.includes("master") || keywords.includes("advanced")) {
      return "6+ months";
    }
    return "3-4 months";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-lg ">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-black">Create New Goal</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-black"
          >
            <XMarkIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-black mb-2">
                  What is your main objective?
                </h3>
                <p className="text-sm text-primary mb-4">
                  Describe what you want to achieve. Be as specific as possible.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-description" className="text-gray-800">
                  Goal Description *
                </Label>
                <Textarea
                  id="goal-description"
                  value={goalDescription}
                  onChange={(e) => {
                    setGoalDescription(e.target.value);
                    if (errors.goalDescription) {
                      setErrors((prev) => ({
                        ...prev,
                        goalDescription: undefined,
                      }));
                    }
                  }}
                  placeholder="e.g., Learn React and build a portfolio website, Get AWS certification, Master machine learning fundamentals..."
                  className={`min-h-[120px] bg-gray-200 mt-2 border-0 text-black placeholder:text-gray-400 focus:ring-2 resize-none ${
                    errors.goalDescription
                      ? "focus:ring-red-500 ring-1 ring-red-500"
                      : "focus:ring-green-500"
                  }`}
                />
                <div className="flex justify-between items-center">
                  <ErrorMessage error={errors.goalDescription} />
                  <span className="text-xs text-gray-500">
                    {goalDescription.length}/500
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleNext}
                  disabled={!goalDescription.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Next
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-black mb-2">
                  Journey Plan
                </h3>
                <p className="text-sm text-gray-800 mb-4">
                  Based on your goal, we've created a suggested timeline. You
                  can customize it if needed.
                </p>
              </div>

              <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-4">
                <h4 className="text-green-400 font-medium mb-2">
                  AI Suggestion
                </h4>
                <p className="text-primary text-sm">
                  We suggest a <strong>{getSuggestedTimeline()}</strong> journey
                  for this goal based on typical learning patterns and
                  complexity.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-title" className="text-black">
                  Goal Title *
                </Label>
                <Input
                  id="goal-title"
                  value={goalTitle}
                  onChange={(e) => {
                    setGoalTitle(e.target.value);
                    if (errors.goalTitle) {
                      setErrors((prev) => ({ ...prev, goalTitle: undefined }));
                    }
                  }}
                  placeholder="Give your goal a catchy title..."
                  className={`bg-gray-700 border-0 text-black placeholder:text-gray-400 focus:ring-2 ${
                    errors.goalTitle
                      ? "focus:ring-red-500 ring-1 ring-red-500"
                      : "focus:ring-green-500"
                  }`}
                />
                <div className="flex justify-between items-center">
                  <ErrorMessage error={errors.goalTitle} />
                  <span className="text-xs text-gray-500">
                    {goalTitle.length}/100
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline" className="text-black">
                  Timeline *
                </Label>
                <Select
                  value={selectedTimeline}
                  onValueChange={(value) => {
                    setSelectedTimeline(value);
                    if (errors.timeline) {
                      setErrors((prev) => ({ ...prev, timeline: undefined }));
                    }
                  }}
                >
                  <SelectTrigger
                    className={`bg-gray-100 border-0 text-black focus:ring-2 ${
                      errors.timeline
                        ? "focus:ring-red-500 ring-1 ring-red-500"
                        : "focus:ring-green-500"
                    }`}
                  >
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black border-gray-600">
                    <SelectItem
                      value="1-month"
                      className="text-black hover:bg-gray-600"
                    >
                      1 Month
                    </SelectItem>
                    <SelectItem
                      value="2-months"
                      className="text-black hover:bg-gray-600"
                    >
                      2 Months
                    </SelectItem>
                    <SelectItem
                      value="3-months"
                      className="text-black hover:bg-gray-600"
                    >
                      3 Months
                    </SelectItem>
                    <SelectItem
                      value="4-months"
                      className="text-black hover:bg-gray-600"
                    >
                      4 Months
                    </SelectItem>
                    <SelectItem
                      value="6-months"
                      className="text-black hover:bg-gray-600"
                    >
                      6 Months
                    </SelectItem>
                    <SelectItem
                      value="12-months"
                      className="text-black hover:bg-gray-600"
                    >
                      12 Months
                    </SelectItem>
                  </SelectContent>
                </Select>
                <ErrorMessage error={errors.timeline} />
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="bg-gray-700 text-black"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleCreateGoal}
                  disabled={isPending}
                  className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                >
                  {isPending ? "Creating Journey..." :(<>creating <Loader className="animate-spin"/> </>)}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
