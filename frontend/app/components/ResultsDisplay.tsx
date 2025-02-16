"use client"

import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  ShipWheelIcon as Wheelchair,
  Eye,
  Ear,
  Brain,
  Baby,
  Activity,
  Heart,
  MessageSquare,
  MapPin,
  ArrowLeft,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { OwnerSuggestions } from "./OwnerSuggestions"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ImageGallery from "./ImageGallery"

interface Observation {
  observation_name: string
  observation_sentiment: "FANTASTIC" | "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "EGREGIOUS"
  associated_disability: string[]
  explanation: string
  feedback: string
}

interface ResultsDisplayProps {
  percentage: number
  observations: Observation[]
  restaurantName: string
  restaurantAddress: string
  processedImages: string[]
  rubricDetails?: { [key: string]: string }
  onReturnToSearch: () => void
}

const DisabilityIcon = ({ type }: { type: string }) => {
  const iconProps = { className: "w-4 h-4" }
  switch (type.toUpperCase()) {
    case "MOBILITY":
      return <Wheelchair {...iconProps} />
    case "VISUAL":
      return <Eye {...iconProps} />
    case "AUDITORY":
      return <Ear {...iconProps} />
    case "COGNITIVE":
      return <Brain {...iconProps} />
    case "DEVELOPMENTAL":
      return <Baby {...iconProps} />
    case "NEUROLOGICAL":
      return <Activity {...iconProps} />
    case "MENTAL_HEALTH":
      return <Heart {...iconProps} />
    case "SPEECH":
      return <MessageSquare {...iconProps} />
    default:
      return null
  }
}

const getDisabilityColor = (type: string) => {
  switch (type.toUpperCase()) {
    case "MOBILITY":
      return "bg-blue-100 text-blue-800"
    case "VISUAL":
      return "bg-purple-100 text-purple-800"
    case "AUDITORY":
      return "bg-green-100 text-green-800"
    case "COGNITIVE":
      return "bg-orange-100 text-orange-800"
    case "DEVELOPMENTAL":
      return "bg-pink-100 text-pink-800"
    case "NEUROLOGICAL":
      return "bg-indigo-100 text-indigo-800"
    case "MENTAL_HEALTH":
      return "bg-red-100 text-red-800"
    case "SPEECH":
      return "bg-teal-100 text-teal-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getScoreColor = (percentage: number) => {
  if (percentage >= 80) {
    return "#22c55e" // green-500
  } else if (percentage >= 50) {
    return "#eab308" // yellow-500
  } else {
    return "#dc2626" // red-600
  }
}

const getScoreText = (percentage: number) => {
  if (percentage >= 80) {
    return "Excellent accessibility"
  } else if (percentage >= 50) {
    return "Moderate accessibility"
  } else {
    return "Poor accessibility"
  }
}

const getObservationColor = (sentiment: string) => {
  switch (sentiment.toUpperCase()) {
    case "FANTASTIC":
    case "POSITIVE":
      return "bg-green-50 border-green-200"
    case "NEUTRAL":
      return "bg-yellow-50 border-yellow-200"
    case "NEGATIVE":
    case "EGREGIOUS":
      return "bg-red-50 border-red-200"
    default:
      return "bg-gray-50 border-gray-200"
  }
}

const getObservationIcon = (sentiment: string) => {
  switch (sentiment.toUpperCase()) {
    case "FANTASTIC":
    case "POSITIVE":
      return <ThumbsUp className="w-5 h-5 text-green-600" />
    case "NEUTRAL":
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />
    case "NEGATIVE":
    case "EGREGIOUS":
      return <ThumbsDown className="w-5 h-5 text-red-600" />
    default:
      return null
  }
}

export default function ResultsDisplay({
  percentage,
  observations,
  restaurantName,
  restaurantAddress,
  processedImages,
  rubricDetails = {},
  onReturnToSearch,
}: ResultsDisplayProps) {
  const [validImages, setValidImages] = useState<string[]>([])
  const scoreColor = getScoreColor(percentage)
  const scoreText = getScoreText(percentage)
  const [showOwnerSuggestions, setShowOwnerSuggestions] = useState(false)

  useEffect(() => {
    console.log("Processed images in ResultsDisplay:", processedImages)
    setValidImages(processedImages.filter((img) => img && img.trim() !== ""))
  }, [processedImages])

  if (!Array.isArray(observations)) {
    console.error("observations is not an array:", observations)
    return <div>Error: Invalid observations data</div>
  }

  return (
    <div className="w-full h-full flex flex-col space-y-8">
      <div className="flex justify-between items-center">
        <Button onClick={onReturnToSearch} variant="outline" size="sm" className="flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to Search
        </Button>
        <h2 className="text-3xl font-bold text-center">{restaurantName}</h2>
        <Button onClick={() => setShowOwnerSuggestions(true)} variant="outline" size="sm">
          I'm a Restaurant Owner
        </Button>
      </div>

      <div className="flex flex-1 gap-8">
        {/* Left side - Vertical style */}
        <div className="w-1/2 space-y-8">
          <Card className="glass-card">
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                {restaurantAddress}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-40 h-40 mb-4">
                <CircularProgressbar
                  value={percentage}
                  text={`${percentage.toFixed(1)}%`}
                  styles={buildStyles({
                    textSize: "16px",
                    pathColor: scoreColor,
                    textColor: scoreColor,
                    trailColor: "#e2e8f0",
                  })}
                />
              </div>
              <p className="text-center text-lg font-semibold" style={{ color: scoreColor }}>
                {scoreText}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Accessibility Observations</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {observations.map((observation, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger
                      className={`p-2 rounded-lg ${getObservationColor(observation.observation_sentiment)}`}
                    >
                      <div className="flex items-center gap-2">
                        {getObservationIcon(observation.observation_sentiment)}
                        <span className="font-medium text-sm">{observation.observation_name}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-2 pb-2">
                      <p className="text-sm text-gray-700 mb-2">{observation.explanation}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {observation.associated_disability.map((disability, disabilityIndex) => (
                          <span
                            key={disabilityIndex}
                            className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getDisabilityColor(
                              disability,
                            )}`}
                          >
                            <DisabilityIcon type={disability} />
                            {disability}
                          </span>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Image carousels and video */}
        <div className="w-1/2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-40">
              <ImageGallery images={validImages.slice(0, 3)} />
            </div>
            <div className="h-40">
              <ImageGallery images={validImages.slice(3, 6)} />
            </div>
            <div className="h-40">
              <ImageGallery images={validImages.slice(6, 9)} />
            </div>
            <div className="h-40">
              <ImageGallery images={validImages.slice(9)} />
            </div>
          </div>
          {restaurantName.toLowerCase() === "panda express" &&
          restaurantAddress.toLowerCase().includes("north milpitas") ? (
            <div className="h-64 rounded-lg overflow-hidden">
              <video
                src="https://fs.rklra.com/output%20(1).mp4"
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
          ) : (
            <div className="h-64 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              <div className="text-center p-4">
                <p className="text-lg font-semibold text-gray-700 mb-2">Video Generation in Progress</p>
                <p className="text-sm text-gray-500">Estimated wait time: 45 minutes</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showOwnerSuggestions && (
        <OwnerSuggestions
          observations={observations}
          percentage={percentage}
          restaurantName={restaurantName}
          onClose={() => setShowOwnerSuggestions(false)}
        />
      )}
    </div>
  )
}

