import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AssessmentFeedbackToast } from "../components/assisment-feedback";
const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;

const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("authToken");
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(`${baseUrl}/api${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.feedback || "An API error occurred.");
  }
  return data.data || data;
};
const createGoalApi = (goalData: any) =>
  apiFetch("/goal/new", { method: "POST", body: JSON.stringify(goalData) });
const createUserApi = (userData: any) =>
  apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
const loginUserApi = (credentials: any) =>
  apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
const getAllGoalsApi = () => apiFetch("/goal/all");
const getGoalByIdApi = (id: string) => apiFetch(`/goal/${id}`);
const getChatHistoryApi = (goalId: string, chunkId: string) =>
  apiFetch(`/goal/chunks/${chunkId}/chathistory`);

const assessChunkApi = async({
  goalId,
  chunkId,
}: {
  goalId: string;
  chunkId: string;
}) => {
    const token = localStorage.getItem("authToken");
    const res = await fetch(`${baseUrl}/api/goal/${goalId}/chunks/${chunkId}/assess`,{
      method:'POST',
      headers:{
        Authorization : `Bearer ${token}`
      }
    }) 
    const data = await res.json();
    if (!res.ok) {
    throw new Error(data.feedback || "An API error occurred.");
  }
  return data;
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGoalApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("New goal created successfully!");
    },
    onError: (error: Error) => {
      toast.error("Failed to create goal", { description: error.message });
    },
  });
};

export const useCreateUser = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: createUserApi,
    onSuccess: (data) => {
      toast.success("Account created! Please log in.");
    },
    onError: (error: Error) => {
      toast.error("Registration Failed", { description: error.message });
    },
  });
};

export const useLoginUser = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: loginUserApi,
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("authToken", data.token);
        toast.success("Welcome back!");
        router.push("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast.error("Login Failed", { description: error.message });
    },
  });
};

export const useAssessChunk = (goalId: string, chunkId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assessChunkApi,
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["goal", goalId] });
      toast.success(
        data.message || "Assessment Passed! You've unlocked the next module."
      );
    },
    onError: (error: Error) => {
      toast.custom(
        (t) =>
          React.createElement(AssessmentFeedbackToast, {
            toastId: t,
            feedback: error.message,
          }),
        { duration: Infinity }
      );
    },
  });
};

export const useGetAllGoals = () => {
  return useQuery({
    queryKey: ["goals"],
    queryFn: getAllGoalsApi,
  });
};

export const useGetGoalByid = (id: string) => {
  return useQuery({
    queryKey: ["goal", id],
    queryFn: () => getGoalByIdApi(id),
    enabled: !!id,
  });
};

export const useGetChatHistory = (
  goalId: string,
  chunkId: string,
  isOpen: boolean
) => {
  return useQuery({
    queryKey: ["chatHistory", goalId, chunkId],
    queryFn: () => getChatHistoryApi(goalId, chunkId),
    enabled: isOpen && !!goalId && !!chunkId,
  });
};
