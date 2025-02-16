import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { X } from "lucide-react"

interface Observation {
  observation_name: string
  observation_sentiment: "FANTASTIC" | "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "EGREGIOUS"
  associated_disability: string[]
  explanation: string
  feedback: string
}

interface OwnerSuggestionsProps {
  observations: Observation[]
  percentage?: number
  restaurantName: string
  onClose: () => void
}

export function OwnerSuggestions({ observations, percentage = 0, restaurantName, onClose }: OwnerSuggestionsProps) {
  const needsImprovement = percentage < 95

  const getImprovementSuggestions = (observations: Observation[]): string[] => {
    return observations
      .filter((obs) => obs.observation_sentiment === "NEGATIVE" || obs.observation_sentiment === "EGREGIOUS")
      .map((obs) => `${obs.observation_name}: ${obs.feedback}`)
  }

  const getPositiveAspects = (observations: Observation[]): string[] => {
    return observations
      .filter((obs) => obs.observation_sentiment === "FANTASTIC" || obs.observation_sentiment === "POSITIVE")
      .map((obs) => `${obs.observation_name}: ${obs.explanation}`)
  }

  const improvements = getImprovementSuggestions(observations)
  const positiveAspects = getPositiveAspects(observations)

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreText = (score: number): string => {
    if (score >= 95) return "Excellent! Your restaurant demonstrates outstanding accessibility."
    if (score >= 80) return "Good job! Your restaurant is quite accessible, but there's room for improvement."
    if (score >= 60) return "Your restaurant has some accessible features, but significant improvements are needed."
    return "Your restaurant needs substantial improvements in accessibility."
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <Card className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10">
          <CardTitle>Accessibility Report for {restaurantName}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4">
            Based on our accessibility analysis, here's a detailed report on your restaurant's accessibility:
          </CardDescription>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Overall Accessibility Score</h3>
              <p className={`text-xl font-bold ${getScoreColor(percentage ?? 0)}`}>
                {percentage != null ? `${percentage.toFixed(1)}%` : "N/A"}
              </p>
              <p className="text-sm text-gray-600 mt-1">{getScoreText(percentage)}</p>
            </div>

            {positiveAspects.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Positive Aspects</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {positiveAspects.map((aspect, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {aspect}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {needsImprovement && improvements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Areas for Improvement</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {improvements.map((improvement, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {improvement}
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {!needsImprovement && (
              <p className="text-green-600 font-semibold">
                Congratulations! Your restaurant has achieved an excellent accessibility score. Keep up the great work
                in maintaining these high standards.
              </p>
            )}

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Next Steps</h3>
              <p>
                {needsImprovement
                  ? "Consider addressing the areas for improvement mentioned above. These changes can significantly enhance the accessibility of your restaurant and improve the experience for all customers."
                  : "While your restaurant demonstrates excellent accessibility, always stay informed about the latest accessibility standards and continue to seek feedback from customers with diverse needs."}
              </p>
              <p className="mt-2">
                For more detailed guidance on implementing these improvements or to learn more about accessibility
                standards, consider consulting with a local accessibility expert or visiting the ADA (Americans with
                Disabilities Act) website.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

