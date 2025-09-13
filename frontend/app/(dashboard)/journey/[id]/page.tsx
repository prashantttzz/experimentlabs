import { GoalJourneyContent } from "@/components/goal-journey-content"

interface GoalJourneyPageProps {
  params: {
    id: string
  }
}

export default function GoalJourneyPage({ params }: GoalJourneyPageProps) {
  return <GoalJourneyContent goalId={params.id} />
}
  