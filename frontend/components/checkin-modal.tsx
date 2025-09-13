"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"

interface CheckinModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FormErrors {
  accomplishments?: string
  progressRating?: string
  general?: string
}

export function CheckinModal({ isOpen, onClose }: CheckinModalProps) {
  const [accomplishments, setAccomplishments] = useState("")
  const [roadblocks, setRoadblocks] = useState("")
  const [motivation, setMotivation] = useState("")
  const [progressRating, setProgressRating] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!accomplishments.trim()) {
      newErrors.accomplishments = "Please share at least one accomplishment"
    } else if (accomplishments.trim().length < 5) {
      newErrors.accomplishments = "Please provide more detail (at least 5 characters)"
    }

    if (!progressRating) {
      newErrors.progressRating = "Please rate your progress"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      onClose()
      // Reset form
      setAccomplishments("")
      setRoadblocks("")
      setMotivation("")
      setProgressRating("")
      setErrors({})
    } catch (error) {
      setErrors({ general: "Failed to submit check-in. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const ErrorMessage = ({ error }: { error?: string }) => {
    if (!error) return null
    return (
      <div className="flex items-center space-x-2 text-red-600 text-sm mt-2">
        <ExclamationTriangleIcon className="w-4 h-4" />
        <span>{error}</span>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Weekly Check-in</h2>
            <p className="text-sm text-slate-500 mt-1">Reflect on your progress and plan ahead</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
            <XMarkIcon className="w-6 h-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {errors.general && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <ErrorMessage error={errors.general} />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="accomplishments" className="text-slate-700 font-medium">
              What did you accomplish this week? <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="accomplishments"
              value={accomplishments}
              onChange={(e) => {
                setAccomplishments(e.target.value)
                if (errors.accomplishments) {
                  setErrors((prev) => ({ ...prev, accomplishments: undefined }))
                }
              }}
              placeholder="Share your wins, completed tasks, or new skills learned..."
              className={`min-h-[80px] bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 resize-none ${
                errors.accomplishments ? "border-red-500 focus:ring-red-500" : "focus:ring-green-500 focus:border-green-500"
              }`}
            />
            <ErrorMessage error={errors.accomplishments} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roadblocks" className="text-slate-700 font-medium">
              Any roadblocks or challenges?
            </Label>
            <Textarea
              id="roadblocks"
              value={roadblocks}
              onChange={(e) => setRoadblocks(e.target.value)}
              placeholder="Describe any obstacles, difficulties, or areas where you need help..."
              className="min-h-[80px] bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-slate-700 font-medium">
              How would you rate your progress this week? <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={progressRating}
              onValueChange={(value) => {
                setProgressRating(value)
                if (errors.progressRating) {
                  setErrors((prev) => ({ ...prev, progressRating: undefined }))
                }
              }}
              className="space-y-2"
            >
              {[
                { value: "excellent", label: "Excellent - Exceeded expectations" },
                { value: "good", label: "Good - Met most goals" },
                { value: "fair", label: "Fair - Some progress made" },
                { value: "poor", label: "Poor - Little to no progress" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-3">
                  <RadioGroupItem value={option.value} id={option.value} className="border-slate-400 text-green-600 focus:ring-green-500" />
                  <Label htmlFor={option.value} className="text-slate-600 font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <ErrorMessage error={errors.progressRating} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivation" className="text-slate-700 font-medium">
              What's motivating you to continue? <span className="text-slate-400 font-normal">(Optional)</span>
            </Label>
            <Textarea
              id="motivation"
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Share what keeps you going or what you're excited about..."
              className="min-h-[60px] bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Submitting..." : "Submit Progress"}
          </Button>
        </div>
      </div>
    </div>
  )
}