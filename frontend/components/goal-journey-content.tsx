"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AITutorModal } from "@/components/ai-tutor-modal";
import {
  ArrowLeftIcon,
  LockClosedIcon,
  ClockIcon,
  BookOpenIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleIconSolid,
  FireIcon,
} from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import { useGetGoalByid } from "@/queries";
import { toast } from "sonner";
import { Loader } from "lucide-react";

interface GoalJourneyContentProps {
  goalId: string;
}

export function GoalJourneyContent({ goalId }: GoalJourneyContentProps) {
  const { data, isError, error, isLoading } = useGetGoalByid(goalId);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [isTutorModalOpen, setIsTutorModalOpen] = useState(false);
  const [selectedModuleTitle, setSelectedModuleTitle] = useState("");
  const [chunkId, setChunkId] = useState("");

  if (isError) {
    toast.error(error.message);
    return (
        <div className="flex h-full w-full items-center justify-center text-red-500">
            Error loading goal data. Please try again.
        </div>
    );
  }

  if (!data || isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader className="animate-spin text-green-500" />
      </div>
    );
  }
  
  const  goal  = data.data;
  const  chunks = goal.chunks;
  const completedModules = chunks.filter((c:any) => c.status === 'COMPLETED').length;
  const currentModule = chunks.find((c:any) => c.status === 'CURRENT');
  const totalModules = chunks.length;
  const overallProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;


  const openTutorModal = (moduleTitle: string,id:string) => {
    setSelectedModuleTitle(moduleTitle);
    setIsTutorModalOpen(true);
    setChunkId(id)
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircleIconSolid className="h-6 w-6 text-white" />;
      case "CURRENT":
        return <FireIcon className="h-6 w-6 text-white" />;
      case "LOCKED":
        return <LockClosedIcon className="h-6 w-6 text-gray-400" />;
      default:
        return <LockClosedIcon className="h-6 w-6 text-gray-400" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200";
      case "intermediate":
        return "bg-green-200 text-green-800 border-green-300";
      case "advanced":
        return "bg-green-300 text-green-900 border-green-400";
      case "expert":
        return "bg-green-400 text-green-900 border-green-500";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div className="space-y-6">
          <Button
            variant="ghost"
            className="flex items-center space-x-2 text-gray-600 hover:text-black hover:bg-gray-100"
            onClick={() => window.history.back()}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>

          <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                     <Badge className={getDifficultyColor(chunks.find((c:any) => c.status === 'CURRENT')?.difficulty || 'Beginner')}>
                        {chunks.find((c:any) => c.status === 'CURRENT')?.difficulty || 'Beginner'}
                     </Badge>
                     <Badge variant="outline" className="border-gray-300 text-gray-600">
                       <ClockIcon className="mr-1 h-4 w-4" />
                       {chunks[0]?.duration} per module
                     </Badge>
                  </div>
                  <h1 className="text-4xl font-bold text-gray-800 leading-tight">
                    {goal.title}
                  </h1>
                  <p className="max-w-2xl text-lg text-gray-500">
                    {goal.description}
                  </p>
                </div>

                <div className="flex flex-col items-center space-y-2">
                  <div className="relative h-24 w-24">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50" cy="50" r="45" strokeWidth="10"
                        className="stroke-current text-gray-200" fill="transparent"
                      />
                      <circle
                        cx="50" cy="50" r="45" strokeWidth="10"
                        className="stroke-current text-green-500 transition-all duration-500"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 45}
                        strokeDashoffset={2 * Math.PI * 45 * (1 - overallProgress / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-green-600">
                        {Math.round(overallProgress)}%
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-500">Overall Progress</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          {chunks.map((chunk:any, index:number) => (
            <div key={chunk.id} className="flex items-start space-x-4 md:space-x-6">
              <div className="flex flex-col items-center self-stretch">
                <div className={cn("relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-4",
                    chunk.status === 'COMPLETED' && 'bg-green-500 border-white',
                    chunk.status === 'CURRENT' && 'bg-green-600 border-white ring-4 ring-green-200',
                    chunk.status === 'LOCKED' && 'bg-gray-300 border-white'
                )}>
                  {getStatusIcon(chunk.status)}
                </div>
                {index < chunks.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gray-200" />
                )}
              </div>

              <Card
                className={cn(
                  "flex-1 border-l-4 transition-all duration-300",
                  chunk.status === "COMPLETED" && "border-green-500 bg-white",
                  chunk.status === "CURRENT" && "border-green-600 bg-white",
                  chunk.status === "LOCKED" && "border-gray-300 bg-gray-50",
                  selectedModule === chunk.id && "ring-2 ring-green-400"
                )}
                onClick={() =>
                  setSelectedModule(
                    selectedModule === chunk.id ? null : chunk.id
                  )
                }
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-4">
                    <div className="space-y-2">
                       <div className="flex items-center space-x-3">
                         <Badge variant="outline" className="border-gray-300 text-gray-600">{chunk.week}</Badge>
                         <Badge className={getDifficultyColor(chunk.difficulty)}>{chunk.difficulty}</Badge>
                       </div>
                       <h3 className="text-xl font-semibold text-gray-800">
                         {chunk.title}
                       </h3>
                    </div>
                     {chunk.status !== "LOCKED" && (
                       <Button
                         size="sm"
                         className="mt-4 sm:mt-0 bg-green-600 text-white hover:bg-green-700 shadow-sm transition-all"
                         onClick={(e) => {
                           e.stopPropagation();

                           openTutorModal(chunk.title,chunk.id);
                         }}
                       >
                         <StarIcon className="mr-2 h-4 w-4" />
                         AI Tutor
                       </Button>
                     )}
                  </div>

                  <p className="mb-4 text-gray-500">{chunk.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                     {chunk.skills.map((skill:any, skillIndex:number) => (
                       <Badge key={skillIndex} variant="secondary" className="bg-green-100 text-green-800">
                         {skill}
                       </Badge>
                     ))}
                  </div>

                  {/* Expanded Content */}
                  {selectedModule === chunk.id && (
                    <div className="mt-6 border-t border-gray-200 pt-6 space-y-4">
                      <h4 className="font-semibold text-gray-700 flex items-center">
                        <BookOpenIcon className="mr-2 h-5 w-5 text-green-500" />
                        Learning Objectives
                      </h4>
                      <ul className="space-y-2">
                        {chunk.objectives.map((objective:any, objIndex:number) => (
                           <li key={objIndex} className="flex items-start space-x-3">
                             <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-green-400" />
                             <span className="text-gray-600">{objective}</span>
                           </li>
                        ))}
                      </ul>
                      
                      {chunk.status === "CURRENT" && (
                         <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                             <p className="text-sm font-semibold text-green-800">This is your current module. Keep up the great work!</p>
                         </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* AI Tutor Modal */}
      <AITutorModal
        isOpen={isTutorModalOpen}
        onClose={() => setIsTutorModalOpen(false)}
        moduleTitle={selectedModuleTitle}
        goalId={goalId}
        chunkId={chunkId}
             />
    </>
  );
}
