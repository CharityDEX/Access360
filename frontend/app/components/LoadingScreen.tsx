import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center space-y-8 p-8" // Updated spacing
    >
      <div className="flex items-center justify-center relative w-24 h-24">
        {" "}
        {/* Updated div structure */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute inset-0 border-4 border-blue-200 border-t-blue-500 rounded-full"
        />
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
      </div>
      <motion.div
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="space-y-2 text-center"
      >
        <p className="text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 animate-gradient">
          Analyzing restaurant accessibility...
        </p>
        <p className="text-sm text-gray-500">This may take a moment</p>
      </motion.div>

      {/* Loading Progress Rings */}
      <div className="relative w-48 h-48">
        <div className="absolute inset-0 loading-ring before:border-4 before:border-blue-500/30 after:border-4 after:border-purple-500/30" />
        <div className="absolute inset-0 loading-ring before:border-4 before:border-blue-500/20 after:border-4 after:border-purple-500/20 before:animation-delay-2000 after:animation-delay-2000" />
      </div>
    </motion.div>
  )
}

