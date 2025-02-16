"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface ProgressIndicatorProps {
  currentStep: number
}

const steps = [
  "Fetching restaurant images...",
  "Processing accessibility features...",
  "Analyzing wheelchair accessibility...",
  "Generating detailed report...",
]

export default function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto space-y-8 p-8 glass-effect"
    >
      <div className="space-y-4 text-center">
        <motion.div
          className="flex items-center justify-center"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360, 0],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <Loader2 className="h-16 w-16 text-gray-700" />
        </motion.div>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-2xl font-medium text-gray-700"
        >
          {steps[currentStep]}
        </motion.div>
      </div>

      <div className="space-y-4">
        <Progress value={progress} className="h-3 bg-purple-200" />
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="space-y-2">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className={`flex items-center space-x-3 ${index <= currentStep ? "text-gray-700" : "text-gray-700/50"}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                index <= currentStep ? "bg-purple-200" : "bg-gray-200"
              }`}
              initial={false}
              animate={index <= currentStep ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              {index < currentStep ? (
                <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : index === currentStep ? (
                <motion.div
                  className="w-3 h-3 bg-purple-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                />
              ) : (
                <div className="w-3 h-3 bg-gray-300 rounded-full" />
              )}
            </motion.div>
            <span className="text-sm">{step}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

