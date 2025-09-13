"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateGoalModal } from "@/components/create-goal-modal";
import { CheckinModal } from "@/components/checkin-modal";
import Link from "next/link";
import { useGetAllGoals } from "@/queries";
import { toast } from "sonner";

const Dashboard = () => {
  const { data, isLoading, isError, error } = useGetAllGoals();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center text-white">
        Loading goals...
      </div>
    );
  }

  if (isError) {
    return toast.error("Failed to load goals");
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-gray-400">
        <p>No goals yet. Start your journey!</p>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="mt-4 bg-white text-gray-900 hover:bg-gray-200"
        >
          + Create New Goal
        </Button>
        <CreateGoalModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Your Dashboard</h1>
            <p className="text-primary mt-2 text-lg">
              🔥 You're on a 5-day learning streak!
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsCheckinModalOpen(true)}
              className=""
            >
              Weekly Check-in
            </Button>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary text-white transition-all duration-300"
            >
              + Create New Goal
            </Button>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.data.map((goal: any) => (
            <Card key={goal.id} className="glass-card card-hover rounded-xl">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg text-black font-semibold leading-tight">
                    {goal.title}
                  </CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-primary text-white text-xs border-green-500"
                  >
                    {goal.timeline}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Progress circle */}
                <div className="flex items-center justify-center">
                  <div className="relative w-24 h-24">
                    <svg
                      className="w-24 h-24 transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-green-500"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${
                          2 * Math.PI * 40 * (1 - (goal.progress || 0) / 100)
                        }`}
                        className="text-green-300 transition-all duration-500"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">
                        {goal.progress ?? 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Milestone */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-black">
                    Next Milestone:
                  </p>
                  <p className="text-sm text-primary  ">
                    {goal.chunks?.[0]?.title || "Not set"}{" "}
                  </p>
                </div>

                {/* Journey link */}
                <Link href={`/journey/${goal.id}`}>
                  <Button
                    variant="ghost"
                    className="w-full bg-primary  border-green-600 text-white"
                  >
                    View Journey
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <CreateGoalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <CheckinModal
        isOpen={isCheckinModalOpen}
        onClose={() => setIsCheckinModalOpen(false)}
      />
    </>
  );
};

export default Dashboard;
