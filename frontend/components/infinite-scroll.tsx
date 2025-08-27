"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { SkeletonLoader } from "./skeleton-loader"

interface InfiniteScrollProps {
  items: any[]
  renderItem: (item: any, index: number) => React.ReactNode
  loadMore: () => Promise<any[]>
  hasMore: boolean
  loading: boolean
  className?: string
}

export function InfiniteScroll({ items, renderItem, loadMore, hasMore, loading, className = "" }: InfiniteScrollProps) {
  const [localLoading, setLocalLoading] = useState(false)
  const observerRef = useRef<IntersectionObserver>()
  const lastItemRef = useRef<HTMLDivElement>(null)

  const lastItemRefCallback = useCallback(
    (node: HTMLDivElement) => {
      if (loading || localLoading) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setLocalLoading(true)
          loadMore().finally(() => setLocalLoading(false))
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [loading, localLoading, hasMore, loadMore],
  )

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item, index) => (
        <div
          key={item.id || index}
          ref={index === items.length - 1 ? lastItemRefCallback : null}
          className="animate-float-up"
          style={{ animationDelay: `${(index % 10) * 100}ms` }}
        >
          {renderItem(item, index)}
        </div>
      ))}

      {(loading || localLoading) && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonLoader key={i} showAvatar={true} />
          ))}
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <div className="inline-flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce-subtle"></div>
            <span>You've reached the end</span>
            <div
              className="w-2 h-2 bg-primary rounded-full animate-bounce-subtle"
              style={{ animationDelay: "0.5s" }}
            ></div>
          </div>
        </div>
      )}
    </div>
  )
}
