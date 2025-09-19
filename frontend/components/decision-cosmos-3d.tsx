"use client"

import React, { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Sphere } from '@react-three/drei'
import * as THREE from 'three'
import type { Decision } from '@/types/decision'

interface DecisionCosmos3DProps {
  decision: Decision
  width?: number
  height?: number
}

// Factor sphere component that orbits around the center
function FactorSphere({
  factor,
  position,
  orbitRadius,
  orbitSpeed,
  startAngle,
  onClick
}: {
  factor: any
  position: [number, number, number]
  orbitRadius: number
  orbitSpeed: number
  startAngle: number
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

  return (
    <group>
      <Sphere
        ref={meshRef}
        args={[sphereSize, 32, 32]}
        position={position}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.2 : 1}
      >
        <meshStandardMaterial
          color={getCategoryColor(factor.category)}
          emissive={getCategoryColor(factor.category)}
          emissiveIntensity={hovered ? 0.3 : 0.1}
          transparent
          opacity={0.9}
        />
      </Sphere>

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
          {factor.weight}%
        </Text>
      </group>
    </group>
  )
}

// Central decision sphere
function DecisionSphere({ decision, onClick }: { decision: Decision, onClick?: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const textRef = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle pulsing
      const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05
      meshRef.current.scale.setScalar(pulse)

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
          color="#4f46e5"
          emissive="#4f46e5"
          emissiveIntensity={hovered ? 0.4 : 0.2}
          transparent
          opacity={0.9}
          roughness={0.2}
          metalness={0.1}
        />
      </Sphere>

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
function Scene({ decision }: { decision: Decision }) {
  const factors = decision.factors || []

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
        onClick={() => console.log('Factor clicked:', factor.name)}
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

      {/* Central decision sphere */}
      <DecisionSphere
        decision={decision}
        onClick={() => console.log('Decision clicked:', decision.title)}
      />

      {/* Factor spheres */}
      {factorSpheres}

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={15}
        autoRotate={true}
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

  React.useEffect(() => {
    setMounted(true)
  }, [])

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

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-lg border shadow-sm overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <h3 className="text-lg font-semibold text-gray-900">3D Decision Cosmos</h3>
        <p className="text-sm text-gray-600">
          Interactive 3D visualization • {decision.factors.length} factors orbiting your decision •
          Click and drag to explore
        </p>
      </div>

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
          <Scene decision={decision} />
        </Canvas>
      </div>
    </div>
  )
}