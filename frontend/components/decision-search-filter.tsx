"use client"

import { useState } from "react"
import { Search, X, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface SearchFilterState {
  searchQuery: string
  statusFilter: "all" | "draft" | "active" | "resolved" | "archived"
  sortBy: "newest" | "oldest" | "title"
}

interface DecisionSearchFilterProps {
  onFilterChange: (filters: SearchFilterState) => void
  resultsCount?: number
}

export function DecisionSearchFilter({ onFilterChange, resultsCount }: DecisionSearchFilterProps) {
  const [filters, setFilters] = useState<SearchFilterState>({
    searchQuery: "",
    statusFilter: "all",
    sortBy: "newest"
  })
  const [showFilters, setShowFilters] = useState(false)

  const updateFilters = (updates: Partial<SearchFilterState>) => {
    const newFilters = { ...filters, ...updates }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const defaultFilters: SearchFilterState = {
      searchQuery: "",
      statusFilter: "all",
      sortBy: "newest"
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  const hasActiveFilters = filters.searchQuery !== "" || filters.statusFilter !== "all" || filters.sortBy !== "newest"

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search decisions by title or description..."
            value={filters.searchQuery}
            onChange={(e) => updateFilters({ searchQuery: e.target.value })}
            className="pl-10 pr-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
          />
          {filters.searchQuery && (
            <button
              onClick={() => updateFilters({ searchQuery: "" })}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className={`border-slate-700 ${showFilters ? 'bg-slate-700' : 'bg-slate-800/50'} hover:bg-slate-700`}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 h-2 w-2 rounded-full bg-blue-500" />
          )}
        </Button>
      </div>

      {/* Filter Controls */}
      {showFilters && (
        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                Status
              </label>
              <Select
                value={filters.statusFilter}
                onValueChange={(value) => updateFilters({ statusFilter: value as SearchFilterState["statusFilter"] })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                Sort By
              </label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => updateFilters({ sortBy: value as SearchFilterState["sortBy"] })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results & Clear */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700">
            <span className="text-sm text-slate-400">
              {resultsCount !== undefined && `${resultsCount} decision${resultsCount !== 1 ? 's' : ''} found`}
            </span>
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <X className="h-3 w-3 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
