"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { XCircleIcon } from "@heroicons/react/24/solid";

interface AssessmentFeedbackToastProps {
  toastId: number | string;
  feedback: string;
}

export const AssessmentFeedbackToast = ({ toastId, feedback }: AssessmentFeedbackToastProps) => {
  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-sm">
      <div className="flex-shrink-0">
        <XCircleIcon className="h-6 w-6 text-red-500" aria-hidden="true" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-800">Assessment Not Passed</h3>
        <p className="mt-1 text-sm text-gray-600 italic">
          "{feedback}"
        </p>
        <Button
          size="sm"
          onClick={() => toast.dismiss(toastId)}
          className="mt-3 bg-red-50 text-red-700 hover:bg-red-100 shadow-none"
        >
          Got it, I'll keep learning
        </Button>
      </div>
    </div>
  );
};
