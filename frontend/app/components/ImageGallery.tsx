"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

interface ImageGalleryProps {
  images: string[]
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loadedImages, setLoadedImages] = useState<string[]>([])

  useEffect(() => {
    console.log("Images received in ImageGallery:", images)
    setLoadedImages(images.filter((img) => img && img.trim() !== ""))
  }, [images])

  useEffect(() => {
    const interval = setInterval(() => {
      if (loadedImages.length > 1) {
        setCurrentIndex((prev) => (prev + 1) % loadedImages.length)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [loadedImages.length])

  if (loadedImages.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg text-gray-500">
        No images available
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Image
            src={loadedImages[currentIndex] || "/placeholder.svg"}
            alt={`Restaurant image ${currentIndex + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            onError={(e) => {
              console.error(`Error loading image: ${loadedImages[currentIndex]}`)
              e.currentTarget.src = "/placeholder.svg"
            }}
          />
        </motion.div>
      </AnimatePresence>
      {loadedImages.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
          {loadedImages.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex ? "bg-white" : "bg-white/50"
              } transition-all duration-300`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

