"use client"

import { useEffect, useRef } from "react"
import { motion, useMotionValue } from "framer-motion"
import React from "react"

export default function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const particles = React.useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        initialX: Math.random() * window.innerWidth,
        initialY: Math.random() * window.innerHeight,
        targetX: Math.random() * window.innerWidth,
        targetY: Math.random() * window.innerHeight,
        opacity: Math.random() * 0.3 + 0.2,
        blur: Math.random() * 2,
        duration: Math.random() * 5 + 10,
      })),
    [],
  )

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      mouseX.set(x)
      mouseY.set(y)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 overflow-hidden bg-[#f8f9ff]">
      {/* Gradient Mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50" />

      {/* Animated Gradient Orbs */}
      <motion.div
        className="absolute top-0 -left-4 w-96 h-96 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"
        style={{
          x: mouseX.get() * -20,
          y: mouseY.get() * -20,
        }}
      />
      <motion.div
        className="absolute top-0 -right-4 w-96 h-96 bg-gradient-to-br from-yellow-300 to-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
        style={{
          x: mouseX.get() * 20,
          y: mouseY.get() * -20,
        }}
      />
      <motion.div
        className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-br from-purple-300 to-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"
        style={{
          x: mouseX.get() * -20,
          y: mouseY.get() * 20,
        }}
      />

      {/* Animated Grid with Parallax */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#fff_20%,transparent_100%)]" />
        <div
          className="absolute inset-0 bg-grid-white/[0.01] bg-[length:100px_100px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#fff_20%,transparent_100%)]"
          style={{
            transform: `translate(${mouseX.get() * 10}px, ${mouseY.get() * 10}px)`,
          }}
        />
      </div>

      {/* Floating Particles with Parallax */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="particle absolute w-2 h-2 bg-gradient-to-br from-white to-transparent rounded-full"
          initial={{
            x: particle.initialX,
            y: particle.initialY,
          }}
          animate={{
            x: [particle.initialX, particle.targetX],
            y: [particle.initialY, particle.targetY],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
            repeatType: "reverse",
          }}
          style={{
            opacity: particle.opacity,
            filter: `blur(${particle.blur}px)`,
          }}
        />
      ))}

      {/* Light Flare Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none" />
    </div>
  )
}

