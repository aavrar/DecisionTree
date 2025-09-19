"use client"

import React, { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Sphere } from '@react-three/drei'
import * as THREE from 'three'
import type { Decision } from '@/types/decision'

// Adventure game types
type AdventureNode = 'start' | 'decision' | string // factor IDs
type AdventureState = {
  currentNode: AdventureNode
  visitedNodes: AdventureNode[]
  isAdventureMode: boolean
  journeyComplete: boolean
}

interface DecisionCosmos3DProps {
  decision: Decision
  width?: number
  height?: number
}

// Camera controller for adventure mode
function AdventureCameraController({
  targetPosition,
  adventureState,
  onTransitionComplete
}: {
  targetPosition: THREE.Vector3
  adventureState: AdventureState
  onTransitionComplete?: () => void
}) {
  const { camera } = useThree()
  const [isTransitioning, setIsTransitioning] = useState(false)

  useFrame((state, delta) => {
    if (adventureState.isAdventureMode && targetPosition) {
      const distance = camera.position.distanceTo(targetPosition)

      if (distance > 0.1) {
        // Smooth camera movement
        camera.position.lerp(targetPosition, delta * 2)
        camera.lookAt(0, 0, 0) // Always look at center
        setIsTransitioning(true)
      } else if (isTransitioning) {
        setIsTransitioning(false)
        onTransitionComplete?.()
      }
    }
  })

  return null
}

// Factor sphere component that orbits around the center
function FactorSphere({
  factor,
  position,
  orbitRadius,
  orbitSpeed,
  startAngle,
  adventureState,
  allFactors,
  onClick
}: {
  factor: any
  position: [number, number, number]
  orbitRadius: number
  orbitSpeed: number
  startAngle: number
  adventureState: AdventureState
  allFactors: any[]
  onClick?: () => void
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const labelRef = useRef<THREE.Group>(null!)
  const percentRef = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (meshRef.current) {
      // Calculate new orbital position with starting angle offset
      const angle = (time * orbitSpeed) + startAngle
      const x = Math.cos(angle) * orbitRadius
      const z = Math.sin(angle) * orbitRadius
      const y = position[1] + Math.sin(angle * 0.5) * 0.2

      // Update sphere position
      meshRef.current.position.set(x, y, z)

      // Gentle rotation for the sphere only
      meshRef.current.rotation.y = time * 0.5

      // Update text positions to follow the sphere and always face camera
      if (labelRef.current) {
        const sphereSize = 0.2 + (factor.weight / 100) * 0.3
        labelRef.current.position.set(x, y + sphereSize + 0.3, z)
        // Make text always face the camera
        labelRef.current.lookAt(state.camera.position)
      }

      if (percentRef.current) {
        const sphereSize = 0.2 + (factor.weight / 100) * 0.3
        percentRef.current.position.set(x, y + sphereSize + 0.5, z)
        // Make text always face the camera
        percentRef.current.lookAt(state.camera.position)
      }
    }
  })

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "financial": return "#10b981" // green
      case "personal": return "#3b82f6"  // blue
      case "career": return "#8b5cf6"    // purple
      case "health": return "#ef4444"    // red
      default: return "#6b7280"          // gray
    }
  }

  const sphereSize = 0.2 + (factor.weight / 100) * 0.3 // 0.2 to 0.5 based on weight

  // Calculate relative percentage
  const totalWeight = allFactors.reduce((sum, f) => sum + f.weight, 0)
  const relativePercentage = totalWeight > 0 ? Math.round((factor.weight / totalWeight) * 100) : 0

  // Adventure mode states
  const isCurrentNode = adventureState.currentNode === factor.id
  const isVisited = adventureState.visitedNodes.includes(factor.id)
  const isClickable = adventureState.isAdventureMode &&
    (adventureState.currentNode === 'decision' || adventureState.currentNode === 'start')

  return (
    <group>
      <Sphere
        ref={meshRef}
        args={[sphereSize, 32, 32]}
        position={position}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={isCurrentNode ? 1.5 : (hovered || isClickable) ? 1.2 : 1}
      >
        <meshStandardMaterial
          color={
            isCurrentNode ? "#ffd700" : // Gold for current
            isVisited ? "#90EE90" : // Light green for visited
            getCategoryColor(factor.category)
          }
          emissive={
            isCurrentNode ? "#ffd700" :
            isVisited ? "#90EE90" :
            getCategoryColor(factor.category)
          }
          emissiveIntensity={
            isCurrentNode ? 0.5 :
            isVisited ? 0.3 :
            hovered ? 0.3 : 0.1
          }
          transparent
          opacity={isClickable ? 1.0 : 0.9}
        />
      </Sphere>

      {/* Adventure mode indicator ring */}
      {isClickable && (
        <mesh position={meshRef.current?.position || [0, 0, 0]}>
          <torusGeometry args={[sphereSize + 0.1, 0.02, 8, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Factor label - follows sphere position */}
      <group ref={labelRef}>
        <Text
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={2}
        >
          {factor.name}
        </Text>
      </group>

      {/* Weight percentage - follows sphere position */}
      <group ref={percentRef}>
        <Text
          fontSize={0.1}
          color="#888"
          anchorX="center"
          anchorY="middle"
        >
          {relativePercentage}%
        </Text>
      </group>
    </group>
  )
}

// Central decision sphere
function DecisionSphere({
  decision,
  adventureState,
  onClick
}: {
  decision: Decision
  adventureState: AdventureState
  onClick?: () => void
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const textRef = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)

  // Adventure mode states
  const isCurrentNode = adventureState.currentNode === 'decision'
  const isStartNode = adventureState.currentNode === 'start'
  const isClickable = adventureState.isAdventureMode && (isStartNode || adventureState.visitedNodes.length > 0)

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle pulsing
      const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05
      meshRef.current.scale.setScalar(pulse * (isCurrentNode ? 1.2 : 1))

      // Slow rotation for sphere only
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2
    }

    // Keep text always facing camera (no rotation)
    if (textRef.current) {
      textRef.current.rotation.set(0, 0, 0)
      textRef.current.lookAt(state.camera.position)
    }
  })

  return (
    <group>
      <Sphere
        ref={meshRef}
        args={[0.8, 64, 64]}
        position={[0, 0, 0]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={
            isCurrentNode ? "#ffd700" : // Gold when current
            isStartNode ? "#ff6b6b" : // Red when starting point
            "#4f46e5" // Default blue
          }
          emissive={
            isCurrentNode ? "#ffd700" :
            isStartNode ? "#ff6b6b" :
            "#4f46e5"
          }
          emissiveIntensity={
            isCurrentNode ? 0.6 :
            isStartNode ? 0.4 :
            hovered ? 0.4 : 0.2
          }
          transparent
          opacity={0.9}
          roughness={0.2}
          metalness={0.1}
        />
      </Sphere>

      {/* Adventure mode indicator ring for decision sphere */}
      {isClickable && !isCurrentNode && (
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[1.0, 0.03, 8, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Decision title - always faces camera */}
      <group ref={textRef} position={[0, 1.2, 0]}>
        <Text
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={4}
        >
          {decision.title || 'Decision'}
        </Text>
      </group>
    </group>
  )
}

// Connection lines from center to factors
function ConnectionLines({ factors }: { factors: any[] }) {
  const linesRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (linesRef.current) {
      const time = state.clock.getElapsedTime()
      linesRef.current.children.forEach((line, index) => {
        const factor = factors[index]
        if (factor && line instanceof THREE.Line) {
          const orbitRadius = 2 + (index * 0.5)
          const orbitSpeed = 0.3 + (factor.weight / 1000)
          const startAngle = (index / factors.length) * Math.PI * 2

          // Update line geometry to follow orbiting spheres
          const geometry = line.geometry as THREE.BufferGeometry
          const positions = geometry.attributes.position.array as Float32Array

          // End point follows the orbiting sphere with starting angle
          const angle = (time * orbitSpeed) + startAngle
          positions[3] = Math.cos(angle) * orbitRadius
          positions[4] = Math.sin(angle * 0.5) * 0.2
          positions[5] = Math.sin(angle) * orbitRadius

          geometry.attributes.position.needsUpdate = true
        }
      })
    }
  })

  const lines = useMemo(() => {
    return factors.map((factor, index) => {
      const orbitRadius = 2 + (index * 0.5)
      const startAngle = (index / factors.length) * Math.PI * 2
      const points = [
        new THREE.Vector3(0, 0, 0), // Center
        new THREE.Vector3(Math.cos(startAngle) * orbitRadius, 0, Math.sin(startAngle) * orbitRadius) // Initial factor position
      ]
      const geometry = new THREE.BufferGeometry().setFromPoints(points)

      return (
        <line key={factor.id} geometry={geometry}>
          <lineBasicMaterial
            color="#ccc"
            transparent
            opacity={0.9}
            linewidth={6}
          />
        </line>
      )
    })
  }, [factors])

  return <group ref={linesRef}>{lines}</group>
}

// Particle field background
function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null!)

  const particlesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const particleCount = 200
    const positions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geometry
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.05
    }
  })

  return (
    <points ref={particlesRef} geometry={particlesGeometry}>
      <pointsMaterial
        color="#4f46e5"
        size={0.02}
        transparent
        opacity={0.6}
        sizeAttenuation={false}
      />
    </points>
  )
}

// Main 3D scene
function Scene({
  decision,
  adventureState,
  onNodeClick,
  onAdventureModeToggle
}: {
  decision: Decision
  adventureState: AdventureState
  onNodeClick: (nodeId: AdventureNode) => void
  onAdventureModeToggle: () => void
}) {
  const factors = decision.factors || []

  // Calculate camera target position based on current node
  const getCameraPosition = (nodeId: AdventureNode): THREE.Vector3 => {
    if (nodeId === 'start' || nodeId === 'decision') {
      return new THREE.Vector3(5, 3, 5) // Default view
    }

    // Find factor position
    const factorIndex = factors.findIndex(f => f.id === nodeId)
    if (factorIndex !== -1) {
      const orbitRadius = 2 + (factorIndex * 0.5)
      const startAngle = (factorIndex / factors.length) * Math.PI * 2
      return new THREE.Vector3(
        Math.cos(startAngle) * (orbitRadius + 2),
        2,
        Math.sin(startAngle) * (orbitRadius + 2)
      )
    }

    return new THREE.Vector3(5, 3, 5)
  }

  const factorSpheres = factors.map((factor, index) => {
    const orbitRadius = 2 + (index * 0.5) // Spiral outward
    const orbitSpeed = 0.3 + (factor.weight / 1000) // Faster orbit for higher weight
    const yPosition = (index % 2) * 0.5 - 0.25 // Slight vertical offset
    const startAngle = (index / factors.length) * Math.PI * 2 // Evenly distribute around circle

    return (
      <FactorSphere
        key={factor.id}
        factor={factor}
        position={[orbitRadius, yPosition, 0]}
        orbitRadius={orbitRadius}
        orbitSpeed={orbitSpeed}
        startAngle={startAngle}
        adventureState={adventureState}
        allFactors={factors}
        onClick={() => onNodeClick(factor.id)}
      />
    )
  })

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 5, 5]} intensity={1} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#4f46e5" />

      {/* Background particles */}
      <ParticleField />

      {/* Connection lines */}
      <ConnectionLines factors={factors} />

      {/* Adventure camera controller */}
      <AdventureCameraController
        targetPosition={getCameraPosition(adventureState.currentNode)}
        adventureState={adventureState}
      />

      {/* Central decision sphere */}
      <DecisionSphere
        decision={decision}
        adventureState={adventureState}
        onClick={() => onNodeClick('decision')}
      />

      {/* Factor spheres */}
      {factorSpheres}

      {/* Camera controls - disabled in adventure mode */}
      <OrbitControls
        enabled={!adventureState.isAdventureMode}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={15}
        autoRotate={!adventureState.isAdventureMode}
        autoRotateSpeed={0.5}
        dampingFactor={0.05}
        enableDamping={true}
      />
    </>
  )
}

export function DecisionCosmos3D({ decision, width = 800, height = 600 }: DecisionCosmos3DProps) {
  const [mounted, setMounted] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [adventureState, setAdventureState] = React.useState<AdventureState>({
    currentNode: 'start',
    visitedNodes: [],
    isAdventureMode: false,
    journeyComplete: false
  })

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleNodeClick = (nodeId: AdventureNode) => {
    if (!adventureState.isAdventureMode) return

    setAdventureState(prev => {
      const newVisited = [...prev.visitedNodes]
      if (!newVisited.includes(nodeId)) {
        newVisited.push(nodeId)
      }

      return {
        ...prev,
        currentNode: nodeId,
        visitedNodes: newVisited,
        journeyComplete: nodeId === 'decision' && newVisited.length >= decision.factors.length
      }
    })
  }

  const toggleAdventureMode = () => {
    setAdventureState(prev => ({
      ...prev,
      isAdventureMode: !prev.isAdventureMode,
      currentNode: prev.isAdventureMode ? 'start' : prev.currentNode,
      visitedNodes: prev.isAdventureMode ? [] : prev.visitedNodes,
      journeyComplete: false
    }))
  }

  const resetAdventure = () => {
    setAdventureState(prev => ({
      ...prev,
      currentNode: 'start',
      visitedNodes: [],
      journeyComplete: false
    }))
  }

  if (!decision.title && decision.factors.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No Decision Cosmos to Display</p>
          <p className="text-sm">Add a decision title and factors to explore the 3D space</p>
        </div>
      </div>
    )
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-lg">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading 3D Cosmos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center text-red-600">
          <p className="text-lg font-medium">3D Rendering Error</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2">Falling back to 2D view recommended</p>
        </div>
      </div>
    )
  }

  const getCurrentNodeInfo = () => {
    if (adventureState.currentNode === 'start') {
      return {
        title: "🚀 Start Your Decision Journey",
        description: "Click on any factor planet to begin exploring your decision space"
      }
    }
    if (adventureState.currentNode === 'decision') {
      return {
        title: "🎯 Decision Center",
        description: adventureState.journeyComplete
          ? "🎉 Journey Complete! You've explored all factors."
          : "You've reached the decision center. Continue exploring factors to complete your journey."
      }
    }

    const factor = decision.factors.find(f => f.id === adventureState.currentNode)

    // Calculate relative percentage like in 2D view
    const totalWeight = decision.factors.reduce((sum, f) => sum + f.weight, 0)
    const relativePercentage = totalWeight > 0 ? Math.round((factor?.weight || 0) / totalWeight * 100) : 0

    return {
      title: `🪐 ${factor?.name || 'Unknown Factor'}`,
      description: `Relative Weight: ${relativePercentage}% • Category: ${factor?.category}`
    }
  }

  const nodeInfo = getCurrentNodeInfo()

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-lg border shadow-sm overflow-hidden relative">
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">3D Decision Cosmos</h3>
            <p className="text-sm text-gray-600">
              {adventureState.isAdventureMode
                ? `Adventure Mode • ${adventureState.visitedNodes.length}/${decision.factors.length} factors explored`
                : `Interactive 3D visualization • ${decision.factors.length} factors orbiting your decision`
              }
            </p>
          </div>
          <button
            onClick={toggleAdventureMode}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              adventureState.isAdventureMode
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {adventureState.isAdventureMode ? '🌌 Exit Adventure' : '🎮 Adventure Mode'}
          </button>
        </div>
      </div>

      {/* Adventure Mode UI Overlay */}
      {adventureState.isAdventureMode && (
        <div className="absolute top-20 left-4 right-4 z-10 bg-black/80 backdrop-blur-md rounded-lg p-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-semibold">{nodeInfo.title}</h4>
              <p className="text-sm text-gray-300">{nodeInfo.description}</p>
            </div>
            <button
              onClick={resetAdventure}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm"
            >
              🔄 Reset
            </button>
          </div>
        </div>
      )}

      <div style={{ width: '100%', height: height }}>
        <Canvas
          camera={{ position: [5, 3, 5], fov: 60 }}
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)'
          }}
          onError={(error) => setError(error.message)}
          fallback={
            <div className="flex items-center justify-center h-full text-white">
              <p>Loading 3D scene...</p>
            </div>
          }
        >
          <Scene
            decision={decision}
            adventureState={adventureState}
            onNodeClick={handleNodeClick}
            onAdventureModeToggle={toggleAdventureMode}
          />
        </Canvas>
      </div>
    </div>
  )
}