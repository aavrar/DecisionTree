"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const calmButtonVariants = cva(
  "calm-button inline-flex items-center justify-center gap-breathing-xs rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-trust-primary text-white hover:bg-trust-secondary shadow-lg hover:shadow-xl",
        secondary: "glassmorphic hover:bg-glass-background-dark text-foreground",
        confidence: "bg-balance-primary text-white hover:bg-balance-secondary shadow-lg hover:shadow-xl",
        gentle: "bg-transparent border border-white/20 hover:bg-white/5 text-foreground",
        energy: "bg-energy-primary text-white hover:bg-energy-secondary shadow-lg hover:shadow-xl",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        calm: "bg-calm-surface hover:bg-calm-surface-hover text-calm-text border border-calm-border",
      },
      size: {
        sm: "h-9 rounded-md px-3",
        md: "h-10 px-4 py-2",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
      emotionalState: {
        calm: "",
        confident: "shadow-balance-primary/20 shadow-lg",
        anxious: "shadow-energy-primary/20 shadow-sm",
        excited: "shadow-trust-primary/20 shadow-lg",
      },
      stressReduction: {
        true: "breathing-animation",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      emotionalState: "calm",
      stressReduction: false,
    },
  }
)

export interface CalmButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof calmButtonVariants> {
  asChild?: boolean
  confidenceLevel?: number // 0-100, affects visual emphasis
  preventDoubleClick?: boolean
  loadingMessage?: string
  isLoading?: boolean
}

const CalmButton = React.forwardRef<HTMLButtonElement, CalmButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    emotionalState,
    stressReduction,
    asChild = false, 
    confidenceLevel,
    preventDoubleClick = true,
    loadingMessage = "Processing...",
    isLoading = false,
    disabled,
    onClick,
    children,
    ...props 
  }, ref) => {
    const [isProcessing, setIsProcessing] = React.useState(false)
    const [lastClickTime, setLastClickTime] = React.useState(0)

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (isLoading || disabled) return
        
        if (preventDoubleClick) {
          const now = Date.now()
          if (now - lastClickTime < 300) return // Prevent clicks within 300ms
          setLastClickTime(now)
        }

        // Brief visual feedback for confidence building
        setIsProcessing(true)
        setTimeout(() => setIsProcessing(false), 150)

        onClick?.(event)
      },
      [onClick, preventDoubleClick, lastClickTime, isLoading, disabled]
    )

    const getConfidenceStyles = () => {
      if (confidenceLevel === undefined) return {}
      
      const opacity = Math.max(0.5, confidenceLevel / 100)
      const scale = 0.95 + (confidenceLevel / 100) * 0.05
      
      return {
        opacity,
        transform: `scale(${scale})`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }
    }

    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(
          calmButtonVariants({ variant, size, emotionalState, stressReduction, className }),
          isProcessing && "scale-95 opacity-80",
          (isLoading || isProcessing) && "pointer-events-none",
          "keyboard-focusable"
        )}
        ref={ref}
        disabled={disabled || isLoading}
        onClick={handleClick}
        style={getConfidenceStyles()}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-breathing-xs">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>{loadingMessage}</span>
          </div>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
CalmButton.displayName = "CalmButton"

// Specialized button variants for decision-making contexts
const DecisionButton = React.forwardRef<
  HTMLButtonElement,
  CalmButtonProps & { decisionWeight?: "primary" | "secondary" | "alternative" }
>(({ decisionWeight = "primary", ...props }, ref) => {
  const getDecisionVariant = () => {
    switch (decisionWeight) {
      case "primary":
        return "confidence"
      case "secondary":
        return "secondary"
      case "alternative":
        return "gentle"
      default:
        return "primary"
    }
  }

  return (
    <CalmButton
      ref={ref}
      variant={getDecisionVariant()}
      stressReduction={true}
      emotionalState="confident"
      {...props}
    />
  )
})
DecisionButton.displayName = "DecisionButton"

const ConfidenceButton = React.forwardRef<
  HTMLButtonElement,
  CalmButtonProps & { 
    confidenceThreshold?: number
    showConfidenceWarning?: boolean
  }
>(({ 
  confidenceThreshold = 60, 
  showConfidenceWarning = true, 
  confidenceLevel = 100,
  ...props 
}, ref) => {
  const isLowConfidence = confidenceLevel < confidenceThreshold
  
  return (
    <div className="flex flex-col gap-breathing-xs">
      <CalmButton
        ref={ref}
        variant={isLowConfidence ? "gentle" : "confidence"}
        emotionalState={isLowConfidence ? "anxious" : "confident"}
        confidenceLevel={confidenceLevel}
        {...props}
      />
      {showConfidenceWarning && isLowConfidence && (
        <p className="text-helper text-energy-primary text-xs">
          Consider reviewing your factors before proceeding
        </p>
      )}
    </div>
  )
})
ConfidenceButton.displayName = "ConfidenceButton"

// Gentle action button for secondary actions
const GentleActionButton = React.forwardRef<
  HTMLButtonElement,
  CalmButtonProps
>((props, ref) => (
  <CalmButton
    ref={ref}
    variant="gentle"
    stressReduction={true}
    emotionalState="calm"
    size="sm"
    {...props}
  />
))
GentleActionButton.displayName = "GentleActionButton"

// Button group for decision choices with Miller's Law compliance
const DecisionButtonGroup = React.forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode
    maxChoices?: number
    className?: string
    orientation?: "horizontal" | "vertical"
  }
>(({ 
  children, 
  maxChoices = 5, 
  className, 
  orientation = "horizontal",
  ...props 
}, ref) => {
  const childrenArray = React.Children.toArray(children)
  
  // Enforce Miller's Law (max 5 choices)
  if (childrenArray.length > maxChoices) {
    console.warn(`DecisionButtonGroup: ${childrenArray.length} choices exceed recommended maximum of ${maxChoices} (Miller's Law)`)
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex gap-breathing-sm",
        orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
        "max-w-full",
        className
      )}
      role="group"
      aria-label="Decision options"
      {...props}
    >
      {childrenArray.slice(0, maxChoices)}
    </div>
  )
})
DecisionButtonGroup.displayName = "DecisionButtonGroup"

export { 
  CalmButton, 
  DecisionButton, 
  ConfidenceButton, 
  GentleActionButton,
  DecisionButtonGroup,
  calmButtonVariants 
}