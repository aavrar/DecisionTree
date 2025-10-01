"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface NetworkNode {
  id: string
  x: number
  y: number
  label: string
  timestamp: string
  delay: number
}

export function FloatingNetworkCards() {
  const [nodes] = useState<NetworkNode[]>([
    {
      id: "1",
      x: 15,
      y: 20,
      label: "Decision #4495",
      timestamp: "2h ago",
      delay: 0
    },
    {
      id: "2",
      x: 75,
      y: 15,
      label: "Node #1125",
      timestamp: "5h ago",
      delay: 2
    },
    {
      id: "3",
      x: 10,
      y: 70,
      label: "Branch #8990",
      timestamp: "1m ago",
      delay: 4
    },
    {
      id: "4",
      x: 80,
      y: 75,
      label: "Choice #3321",
      timestamp: "12h ago",
      delay: 1
    },
    {
      id: "5",
      x: 45,
      y: 40,
      label: "Path #7654",
      timestamp: "3h ago",
      delay: 3
    }
  ])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* SVG for connection lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: "#ffffff", stopOpacity: 0 }} />
            <stop offset="50%" style={{ stopColor: "#ffffff", stopOpacity: 0.2 }} />
            <stop offset="100%" style={{ stopColor: "#ffffff", stopOpacity: 0 }} />
          </linearGradient>
        </defs>

        {/* Connection lines between nodes */}
        <motion.line
          x1={`${nodes[0].x}%`}
          y1={`${nodes[0].y}%`}
          x2={`${nodes[1].x}%`}
          y2={`${nodes[1].y}%`}
          stroke="url(#lineGradient)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.line
          x1={`${nodes[1].x}%`}
          y1={`${nodes[1].y}%`}
          x2={`${nodes[4].x}%`}
          y2={`${nodes[4].y}%`}
          stroke="url(#lineGradient)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 1, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.line
          x1={`${nodes[4].x}%`}
          y1={`${nodes[4].y}%`}
          x2={`${nodes[2].x}%`}
          y2={`${nodes[2].y}%`}
          stroke="url(#lineGradient)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 2, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.line
          x1={`${nodes[2].x}%`}
          y1={`${nodes[2].y}%`}
          x2={`${nodes[3].x}%`}
          y2={`${nodes[3].y}%`}
          stroke="url(#lineGradient)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 3, repeat: Infinity, repeatType: "reverse" }}
        />
      </svg>

      {/* Floating cards */}
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-lg"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            zIndex: 2
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0.7, 1, 0.7],
            scale: [0.95, 1, 0.95],
            y: [0, -10, 0],
            x: [0, 5, 0]
          }}
          transition={{
            duration: 6,
            delay: node.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Node icon */}
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center bg-white/5">
              <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="3" strokeWidth="2" />
                <circle cx="6" cy="12" r="1" fill="currentColor" />
                <circle cx="18" cy="12" r="1" fill="currentColor" />
                <circle cx="12" cy="6" r="1" fill="currentColor" />
                <circle cx="12" cy="18" r="1" fill="currentColor" />
                <line x1="12" y1="9" x2="12" y2="6" strokeWidth="1" />
                <line x1="12" y1="18" x2="12" y2="15" strokeWidth="1" />
                <line x1="9" y1="12" x2="6" y2="12" strokeWidth="1" />
                <line x1="18" y1="12" x2="15" y2="12" strokeWidth="1" />
              </svg>
            </div>
            <div>
              <div className="text-white text-xs font-medium">{node.label}</div>
              <div className="text-white/50 text-[10px]">{node.timestamp}</div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Floating coin icons */}
      <motion.div
        className="absolute w-10 h-10 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center"
        style={{ left: "25%", top: "35%" }}
        animate={{
          y: [0, -15, 0],
          rotate: [0, 5, 0]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute w-12 h-12 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center"
        style={{ right: "20%", top: "50%" }}
        animate={{
          y: [0, -20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{
          duration: 6,
          delay: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <span className="text-white/70 text-lg font-bold">$</span>
      </motion.div>
    </div>
  )
}
