"use client"

interface SkeletonLoaderProps {
  className?: string
  lines?: number
  showAvatar?: boolean
}

export function SkeletonLoader({ className = "", lines = 3, showAvatar = false }: SkeletonLoaderProps) {
  return (
    <div className={`animate-pulse space-y-4 ${className}`}>
      {showAvatar && (
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-muted rounded-full skeleton"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded skeleton w-1/4"></div>
            <div className="h-3 bg-muted rounded skeleton w-1/3"></div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-4 bg-muted rounded skeleton ${i === lines - 1 ? "w-2/3" : "w-full"}`}
            style={{ animationDelay: `${i * 200}ms` }}
          ></div>
        ))}
      </div>
    </div>
  )
}
