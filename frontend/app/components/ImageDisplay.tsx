"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"

interface ImageDisplayProps {
  images: string[]
}

export default function ImageDisplay({ images }: ImageDisplayProps) {
  const [currentImage, setCurrentImage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadedImages, setLoadedImages] = useState<number[]>([])

  useEffect(() => {
    console.log("Images received in ImageDisplay:", images)
    setIsLoading(true)
    setLoadedImages([])
    setCurrentImage(0)
  }, [images])

  useEffect(() => {
    const interval = setInterval(() => {
      if (images.length > 1) {
        setCurrentImage((prev) => (prev + 1) % images.length)
      }
    }, 1000) // Change to 1000ms (1 second)

    return () => clearInterval(interval)
  }, [images.length])

  const handleImageLoad = (index: number) => {
    console.log(`Image ${index} loaded successfully`)
    setLoadedImages((prev) => {
      const newLoaded = [...prev, index]
      if (newLoaded.length === images.length) {
        setIsLoading(false)
      }
      return newLoaded
    })
  }

  const handleImageError = (index: number) => {
    console.error(`Failed to load image ${index}`)
    // Remove the failed image from the array
    const newImages = images.filter((_, i) => i !== index)
    if (newImages.length === 0) {
      setIsLoading(false)
    }
  }

  if (!images.length) {
    return <div className="text-center text-gray-500">No images available</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center w-full gap-4"
    >
      <div className="relative w-full aspect-[16/9] max-w-3xl rounded-2xl overflow-hidden shadow-lg">
        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="flex items-center gap-3"
              >
                <Loader2 className="w-8 h-8 text-blue-500" />
                <span className="text-blue-500 font-medium">Loading images...</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Images */}
        <div className="relative w-full h-full transition-opacity duration-300 ease-in-out">
          {images.map((src, index) => (
            <motion.div
              key={src}
              initial={{ opacity: 0 }}
              animate={{ opacity: index === currentImage ? 1 : 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }} // Increase duration to 0.5 seconds
              className="absolute inset-0"
            >
              <Image
                src={src || "/placeholder.svg"}
                alt={`Street view ${index + 1}`}
                fill
                className="object-cover transition-opacity duration-500 ease-in-out" // Add transition
                onLoad={() => handleImageLoad(index)}
                onError={() => handleImageError(index)}
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
            </motion.div>
          ))}
        </div>

        {/* Navigation Dots */}
        {images.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 z-40"
          >
            {images.map((_, index) => (
              <motion.button
                key={index}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentImage ? "bg-white shadow-lg scale-125" : "bg-white/50 hover:bg-white/75"
                }`}
                onClick={() => setCurrentImage(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </motion.div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
      </div>

      {/* Image Counter */}
      {images.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-sm text-gray-500 font-medium"
        >
          Image {currentImage + 1} of {images.length}
        </motion.div>
      )}
    </motion.div>
  )
}

