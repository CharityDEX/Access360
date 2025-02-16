"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ResultsDisplay from "./components/ResultsDisplay"
import { PlacesSearch } from "./components/places-search"
import ProgressIndicator from "./components/ProgressIndicator"
import { getImages, getAccessibilityAnalysis } from "./actions"
import { toast } from "sonner"
import { Accessibility } from "lucide-react"

interface SelectedLocation {
  name: string
  address: string
}

interface AIAnalysis {
  Percentage: number
  observations: Array<{
    observation_name: string
    observation_sentiment: "FANTASTIC" | "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "EGREGIOUS"
    associated_disability: string[]
    explanation: string
    feedback: string
  }>
}

export default function Home() {
  const [step, setStep] = useState(0)
  const [analysisStep, setAnalysisStep] = useState(0)
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null)
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [processedImages, setProcessedImages] = useState<string[]>([])

  const handleSubmit = async (location: SelectedLocation) => {
    setSelectedLocation(location)
    setStep(1)
    setAnalysisStep(0)

    try {
      setAnalysisStep(0)
      const fetchedImages = await getImages(location.address)
      if (!fetchedImages || !fetchedImages.processed_images || fetchedImages.processed_images.length === 0) {
        toast.warning("No processed images found for this location. Proceeding with analysis.")
      } else {
        setProcessedImages(fetchedImages.processed_images)
      }

      setAnalysisStep(1)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setAnalysisStep(2)
      const analysisData = await getAccessibilityAnalysis(location.address, location.name)

      if (!analysisData || !Array.isArray(analysisData.observations)) {
        throw new Error("Invalid analysis data received")
      }

      setAnalysisStep(3)
      setAnalysis(analysisData)

      await new Promise((resolve) => setTimeout(resolve, 500))

      setStep(3)
      toast.success("Analysis completed successfully!")
    } catch (error) {
      console.error("Error in handleSubmit:", error)
      setStep(0)
      toast.error("Failed to analyze location. Please try again later.")
    }
  }

  const handleReturnToSearch = () => {
    setStep(0)
    setAnalysis(null)
    setSelectedLocation(null)
    setProcessedImages([])
    setAnalysisStep(0)
  }

  return (
    <div className="gradient-background min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <AnimatePresence mode="wait">
        {step === 3 && analysis && selectedLocation ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-7xl mx-auto"
          >
            <ResultsDisplay
              percentage={analysis.Percentage}
              observations={analysis.observations}
              restaurantName={selectedLocation.name}
              restaurantAddress={selectedLocation.address}
              processedImages={processedImages}
              onReturnToSearch={handleReturnToSearch}
            />
          </motion.div>
        ) : step === 1 ? (
          <motion.div
            key="progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-3xl mx-auto flex items-center justify-center min-h-screen"
          >
            <ProgressIndicator currentStep={analysisStep} />
          </motion.div>
        ) : (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-3xl mx-auto text-center space-y-12"
          >
            <div className="space-y-6">
              <motion.div
                className="flex justify-center"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Accessibility className="w-24 h-24 text-purple-800" />
              </motion.div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-purple-900">
                Analyze Accessibility with
              </h1>
              <motion.div
                className="bg-purple-800 text-white p-3 rounded-lg shadow-lg inline-block"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <span className="text-3xl md:text-5xl font-bold">
                  Access <span className="text-purple-300">360</span>
                </span>
              </motion.div>
              <p className="text-lg md:text-xl text-black font-semibold">
                Empowering Hassle-Free Dining in the US & Canada with Caring, AI-Powered Accessibility Insights.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="w-full max-w-2xl mx-auto"
            >
              <PlacesSearch onLocationSelect={handleSubmit} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

