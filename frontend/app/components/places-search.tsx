"use client"

import type React from "react"
import { motion } from "framer-motion"
import { useState, useRef } from "react"
import { Search, MapPin, Loader2, Mic, Square } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface Prediction {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

interface RestaurantInfo {
  restaurantName: string
  address: string
}

interface PlacesSearchProps {
  onLocationSelect: (location: { name: string; address: string }) => void
}

export function PlacesSearch({ onLocationSelect }: PlacesSearchProps) {
  const [query, setQuery] = useState("")
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<{ name: string; address: string } | null>(null)
  const debounceTimeout = useRef<NodeJS.Timeout>()
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const fetchPredictions = async (input: string) => {
    if (!input) {
      setPredictions([])
      return
    }

    setIsLoading(true)
    setIsSearching(true)
    try {
      const response = await fetch(`/api/places-autocomplete?input=${encodeURIComponent(input)}`)
      const data = await response.json()
      setPredictions(data.predictions || [])
    } catch (error) {
      console.error("Error fetching predictions:", error)
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }

  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        if (chunksRef.current.length === 0) {
          setError("No audio data recorded")
          return
        }

        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" })
        setIsProcessing(true)

        try {
          const formData = new FormData()
          formData.append("file", audioBlob, "recording.webm")

          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error("Failed to transcribe audio")
          }

          const { text } = await response.json()

          const infoResponse = await fetch("/api/extract-info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          })

          if (!infoResponse.ok) {
            throw new Error("Failed to extract information")
          }

          const info: RestaurantInfo = await infoResponse.json()
          if (info.restaurantName || info.address) {
            const searchQuery = `${info.restaurantName}, ${info.address}`.trim()
            setQuery(searchQuery)
            const predictionsResponse = await fetch(`/api/places-autocomplete?input=${encodeURIComponent(searchQuery)}`)
            const predictionsData = await predictionsResponse.json()

            if (predictionsData.predictions && predictionsData.predictions.length > 0) {
              const topPrediction = predictionsData.predictions[0]
              const location = {
                name: topPrediction.structured_formatting.main_text,
                address: topPrediction.description,
              }
              setSelectedLocation(location)
              setPredictions([])
              setIsSearching(false)
              onLocationSelect(location)
            }
          }
        } catch (error) {
          console.error("Processing error:", error)
          setError(error instanceof Error ? error.message : "Failed to process audio")
        } finally {
          setIsProcessing(false)
        }
      }

      mediaRecorder.start(200)
      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setError("Could not access microphone")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      setIsRecording(false)
    }
  }

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedLocation(null)
    clearTimeout(debounceTimeout.current)
    debounceTimeout.current = setTimeout(() => fetchPredictions(value), 300)
  }

  const handleLocationSelect = (prediction: Prediction) => {
    const location = {
      name: prediction.structured_formatting.main_text,
      address: prediction.description,
    }
    setQuery(prediction.description)
    setSelectedLocation(location)
    setPredictions([])
    setIsSearching(false)
  }

  return (
    <div className="w-full space-y-6">
      <div className="bg-white border-2 border-purple-800 rounded-lg overflow-hidden shadow-lg">
        <div className="flex items-center px-6 py-4">
          <Search className="w-5 h-5 text-purple-800 mr-3" />
          <Input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search for restaurants..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-lg placeholder:text-gray-500 bg-transparent text-black font-semibold"
          />
          <div className="relative ml-2">
            <Button
              type="button"
              size="icon"
              variant={isRecording ? "destructive" : "ghost"}
              className={cn("rounded-full relative", isRecording && "hover:bg-destructive/90")}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  isRecording ? "bg-destructive" : "bg-purple-800",
                )}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : isRecording ? (
                  <Square className="h-4 w-4 text-white" />
                ) : (
                  <Mic className="h-4 w-4 text-white" />
                )}
              </div>
            </Button>
            {isRecording && (
              <div className="absolute -top-1 -right-1">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              </div>
            )}
          </div>
        </div>
        {error && (
          <Alert variant="destructive" className="mx-4 mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {predictions.length > 0 && (
          <div className="border-t border-gray-200">
            {predictions.map((prediction) => (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                key={prediction.place_id}
                className="flex items-start gap-3 p-4 hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => handleLocationSelect(prediction)}
              >
                <MapPin className="w-5 h-5 text-purple-800 mt-0.5" />
                <div className="flex flex-col">
                  <span className="font-semibold text-black">{prediction.structured_formatting.main_text}</span>
                  <span className="text-sm text-gray-700">{prediction.structured_formatting.secondary_text}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {selectedLocation && !isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={() => onLocationSelect(selectedLocation)}
            className="w-full py-6 bg-purple-800 text-white text-lg font-bold rounded-full transition-all duration-300 ease-in-out hover:bg-purple-700 hover:shadow-lg"
          >
            Check Accessibility
          </Button>
        </motion.div>
      )}
    </div>
  )
}

