"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw, Download, GitBranch, Play, Pause } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Sphere, Line } from "@react-three/drei"
import * as THREE from "three"
import type { Decision } from "@/types/decision"

interface VisualizationAreaProps {
  decision: Decision
}

function AnimatedNode({ position, label, type, onClick }: any) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
      meshRef.current.scale.setScalar(hovered ? 1.2 : 1)
    }
  })

  const getColor = () => {
    switch (type) {
      case "root":
        return "#3b82f6"
      case "success":
        return "#10b981"
      case "warning":
        return "#f59e0b"
      case "danger":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[0.5, 16, 16]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial color={getColor()} />
      </Sphere>
      <Text position={[0, -1, 0]} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
        {label}
      </Text>
    </group>
  )
}

function AnimatedPath({ start, end, progress }: any) {
  const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)]

  const lineRef = useRef<any>(null)

  useEffect(() => {
    if (lineRef.current) {
      const geometry = lineRef.current.geometry
      const positions = geometry.attributes.position.array
      const totalPoints = positions.length / 3
      const visiblePoints = Math.floor(totalPoints * progress)

      for (let i = visiblePoints * 3; i < positions.length; i++) {
        positions[i] = 0
      }
      geometry.attributes.position.needsUpdate = true
    }
  }, [progress])

  return <Line ref={lineRef} points={points} color="#3b82f6" lineWidth={3} />
}

export function VisualizationArea({ decision }: VisualizationAreaProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [animationProgress, setAnimationProgress] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [view3D, setView3D] = useState(false)

  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setAnimationProgress((prev) => {
          if (prev >= 1) {
            setIsAnimating(false)
            return 1
          }
          return prev + 0.02
        })
      }, 50)
      return () => clearInterval(interval)
    }
  }, [isAnimating])

  const startAnimation = () => {
    setAnimationProgress(0)
    setIsAnimating(true)
  }

  // Mock tree nodes for visualization
  const mockNodes = [
    { id: "1", label: decision.title, type: "root", x: 50, y: 20, position: [0, 2, 0] },
    { id: "2", label: "High Financial Impact", type: "success", x: 25, y: 50, position: [-2, 0, 0] },
    { id: "3", label: "Low Financial Impact", type: "warning", x: 75, y: 50, position: [2, 0, 0] },
    { id: "4", label: "Pursue Change", type: "success", x: 15, y: 80, position: [-3, -2, 0] },
    { id: "5", label: "Stay Current", type: "danger", x: 35, y: 80, position: [-1, -2, 0] },
    { id: "6", label: "Gradual Transition", type: "warning", x: 65, y: 80, position: [1, -2, 0] },
    { id: "7", label: "Maintain Status Quo", type: "danger", x: 85, y: 80, position: [3, -2, 0] },
  ]

  const getNodeStyle = (type: string, isSelected: boolean) => {
    const baseClasses =
      "absolute transform -translate-x-1/2 -translate-y-1/2 px-3 py-2 rounded-lg text-xs font-medium shadow-lg hover:scale-110 transition-all duration-300 cursor-pointer"
    const selectedClasses = isSelected ? "ring-2 ring-white ring-offset-2 scale-110" : ""

    switch (type) {
      case "root":
        return `${baseClasses} ${selectedClasses} bg-primary text-primary-foreground animate-pulse`
      case "success":
        return `${baseClasses} ${selectedClasses} gradient-success text-white`
      case "warning":
        return `${baseClasses} ${selectedClasses} gradient-warning text-white`
      case "danger":
        return `${baseClasses} ${selectedClasses} gradient-danger text-white`
      default:
        return `${baseClasses} ${selectedClasses} bg-card text-card-foreground`
    }
  }

  return (
    <Card className="hover-lift glassmorphism animate-float-up" style={{ animationDelay: "200ms" }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary animate-pulse" />
            Decision Tree Visualization
          </CardTitle>

          {/* Enhanced Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView3D(!view3D)}
              className="hover:scale-110 transition-transform"
            >
              {view3D ? "2D" : "3D"}
            </Button>
            <Button variant="ghost" size="sm" onClick={startAnimation} className="hover:scale-110 transition-transform">
              {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" className="hover:scale-110 transition-transform">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hover:scale-110 transition-transform">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hover:scale-110 transition-transform">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hover:scale-110 transition-transform">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative h-96 bg-gradient-to-br from-background to-muted/20 rounded-lg border glassmorphism overflow-hidden">
          {view3D ? (
            <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

              {mockNodes.map((node) => (
                <AnimatedNode
                  key={node.id}
                  position={node.position}
                  label={node.label}
                  type={node.type}
                  onClick={() => setSelectedNode(node.id)}
                />
              ))}

              {/* Animated connections */}
              <AnimatedPath start={[0, 2, 0]} end={[-2, 0, 0]} progress={animationProgress} />
              <AnimatedPath start={[0, 2, 0]} end={[2, 0, 0]} progress={animationProgress} />
            </Canvas>
          ) : (
            // Enhanced 2D visualization
            <>
              {/* Animated SVG connections */}
              <svg className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id="animatedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Animated connection lines */}
                <line
                  x1="50%"
                  y1="20%"
                  x2="25%"
                  y2="50%"
                  stroke="url(#animatedGradient)"
                  strokeWidth="3"
                  filter="url(#glow)"
                  strokeDasharray={isAnimating ? "5,5" : "none"}
                  className={isAnimating ? "animate-pulse" : ""}
                />
                <line
                  x1="50%"
                  y1="20%"
                  x2="75%"
                  y2="50%"
                  stroke="url(#animatedGradient)"
                  strokeWidth="3"
                  filter="url(#glow)"
                  strokeDasharray={isAnimating ? "5,5" : "none"}
                  className={isAnimating ? "animate-pulse" : ""}
                />

                {/* More animated lines */}
                <line
                  x1="25%"
                  y1="50%"
                  x2="15%"
                  y2="80%"
                  stroke="url(#animatedGradient)"
                  strokeWidth="2"
                  filter="url(#glow)"
                />
                <line
                  x1="25%"
                  y1="50%"
                  x2="35%"
                  y2="80%"
                  stroke="url(#animatedGradient)"
                  strokeWidth="2"
                  filter="url(#glow)"
                />
                <line
                  x1="75%"
                  y1="50%"
                  x2="65%"
                  y2="80%"
                  stroke="url(#animatedGradient)"
                  strokeWidth="2"
                  filter="url(#glow)"
                />
                <line
                  x1="75%"
                  y1="50%"
                  x2="85%"
                  y2="80%"
                  stroke="url(#animatedGradient)"
                  strokeWidth="2"
                  filter="url(#glow)"
                />
              </svg>

              {/* Enhanced Tree Nodes */}
              {mockNodes.map((node, index) => (
                <div
                  key={node.id}
                  className={getNodeStyle(node.type, selectedNode === node.id)}
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    animationDelay: `${index * 200}ms`,
                  }}
                  onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                >
                  {node.label}
                  {selectedNode === node.id && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-popover text-popover-foreground px-2 py-1 rounded shadow-lg whitespace-nowrap">
                      Click to explore options
                    </div>
                  )}
                </div>
              ))}

              {/* Particle effects */}
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${3 + Math.random() * 4}s`,
                  }}
                />
              ))}
            </>
          )}

          {/* Progress indicator */}
          {isAnimating && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-background/80 backdrop-blur-sm rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100"
                  style={{ width: `${animationProgress * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Legend with heat map colors */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded gradient-success animate-pulse"></div>
            <span>High Confidence</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded gradient-warning animate-pulse"></div>
            <span>Medium Confidence</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded gradient-danger animate-pulse"></div>
            <span>Low Confidence</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary animate-pulse"></div>
            <span>Decision Point</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
