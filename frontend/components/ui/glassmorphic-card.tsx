"use client"

import React, { forwardRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface GlassmorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "card" | "surface" | "panel"
  confidenceLevel?: "high" | "medium" | "low"
  stressIndicator?: boolean
  progressiveReveal?: boolean
  revealDelay?: number
  emotionalState?: "confident" | "anxious" | "calm" | "excited"
  children: React.ReactNode
}

const GlassmorphicCard = forwardRef<HTMLDivElement, GlassmorphicCardProps>(
  ({ 
    className, 
    variant = "card",
    confidenceLevel,
    stressIndicator = false,
    progressiveReveal = false,
    revealDelay = 0,
    emotionalState = "calm",
    children,
    ...props 
  }, ref) => {
    const [isRevealed, setIsRevealed] = useState(!progressiveReveal)

    useEffect(() => {
      if (progressiveReveal) {
        const timer = setTimeout(() => {
          setIsRevealed(true)
        }, revealDelay)
        return () => clearTimeout(timer)
      }
    }, [progressiveReveal, revealDelay])

    const getVariantStyles = () => {
      switch (variant) {
        case "surface":
          return "glassmorphic-surface"
        case "panel":
          return "glassmorphic-panel"
        default:
          return "glassmorphic-card"
      }
    }

    const getConfidenceStyles = () => {
      if (!confidenceLevel) return ""
      return `confidence-${confidenceLevel}`
    }

    const getEmotionalStyles = () => {
      const baseStyles = "emotional-indicator"
      switch (emotionalState) {
        case "confident":
          return `${baseStyles} confidence-high`
        case "anxious":
          return `${baseStyles} confidence-low stress-high`
        case "excited":
          return `${baseStyles} confidence-medium`
        default:
          return baseStyles
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          getVariantStyles(),
          "gentle-hover",
          "keyboard-focusable",
          "breathing-animation",
          confidenceLevel && getConfidenceStyles(),
          stressIndicator && "stress-indicator",
          progressiveReveal && "progressive-reveal",
          progressiveReveal && isRevealed && "revealed",
          emotionalState !== "calm" && getEmotionalStyles(),
          className
        )}
        style={{
          "--reveal-delay": `${revealDelay}ms`,
        } as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    )
  }
)

GlassmorphicCard.displayName = "GlassmorphicCard"

// Compound components for better composition
const GlassmorphicCardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col gap-breathing-xs",
      "text-decision-primary",
      "border-b border-white/10 pb-breathing-md mb-breathing-md",
      className
    )}
    {...props}
  />
))
GlassmorphicCardHeader.displayName = "GlassmorphicCardHeader"

const GlassmorphicCardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-decision-primary font-semibold leading-none tracking-tight",
      "flex items-center gap-breathing-sm",
      className
    )}
    {...props}
  />
))
GlassmorphicCardTitle.displayName = "GlassmorphicCardTitle"

const GlassmorphicCardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-helper", className)}
    {...props}
  />
))
GlassmorphicCardDescription.displayName = "GlassmorphicCardDescription"

const GlassmorphicCardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("flex flex-col gap-breathing-md", className)} 
    {...props} 
  />
))
GlassmorphicCardContent.displayName = "GlassmorphicCardContent"

const GlassmorphicCardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between",
      "border-t border-white/10 pt-breathing-md mt-breathing-md",
      className
    )}
    {...props}
  />
))
GlassmorphicCardFooter.displayName = "GlassmorphicCardFooter"

// Psychology-informed progress indicator
const ConfidenceIndicator = forwardRef<
  HTMLDivElement,
  {
    level: number // 0-100
    showLabel?: boolean
    className?: string
  }
>(({ level, showLabel = true, className }, ref) => {
  const getConfidenceColor = () => {
    if (level >= 80) return "var(--balance-primary)"
    if (level >= 60) return "var(--trust-primary)"
    if (level >= 40) return "var(--trust-secondary)"
    return "var(--energy-primary)"
  }

  const getConfidenceLabel = () => {
    if (level >= 80) return "High Confidence"
    if (level >= 60) return "Good Confidence"
    if (level >= 40) return "Moderate Confidence"
    return "Building Confidence"
  }

  return (
    <div ref={ref} className={cn("flex flex-col gap-breathing-xs", className)}>
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className="text-helper">{getConfidenceLabel()}</span>
          <span className="text-helper font-medium">{level}%</span>
        </div>
      )}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-700 ease-out rounded-full"
          style={{
            width: `${level}%`,
            backgroundColor: getConfidenceColor(),
          }}
        />
      </div>
    </div>
  )
})
ConfidenceIndicator.displayName = "ConfidenceIndicator"

// Stress-reducing loading state
const CalmLoadingState = forwardRef<
  HTMLDivElement,
  {
    message?: string
    className?: string
  }
>(({ message = "Processing your decision...", className }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col items-center justify-center gap-breathing-md py-breathing-xl",
      className
    )}
  >
    <div className="relative">
      <div className="w-8 h-8 border-2 border-white/20 rounded-full" />
      <div className="absolute inset-0 w-8 h-8 border-2 border-transparent border-t-current rounded-full animate-spin" />
    </div>
    <p className="text-helper text-center breathing-animation">{message}</p>
  </div>
))
CalmLoadingState.displayName = "CalmLoadingState"

export {
  GlassmorphicCard,
  GlassmorphicCardHeader,
  GlassmorphicCardTitle,
  GlassmorphicCardDescription,
  GlassmorphicCardContent,
  GlassmorphicCardFooter,
  ConfidenceIndicator,
  CalmLoadingState,
}