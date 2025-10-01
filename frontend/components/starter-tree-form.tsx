"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Check } from "lucide-react"

interface StarterTreeFormProps {
  onComplete: (data: { title: string; factors: string[] }) => void
}

export function StarterTreeForm({ onComplete }: StarterTreeFormProps) {
  const [title, setTitle] = useState("")
  const [factors, setFactors] = useState<string[]>(["", ""])
  const [isValid, setIsValid] = useState(false)

  const handleFactorChange = (index: number, value: string) => {
    const newFactors = [...factors]
    newFactors[index] = value
    setFactors(newFactors)
    validateForm(title, newFactors)
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    validateForm(value, factors)
  }

  const validateForm = (t: string, f: string[]) => {
    const valid = t.trim().length > 0 && f.filter(factor => factor.trim().length > 0).length >= 2
    setIsValid(valid)
  }

  const addFactor = () => {
    setFactors([...factors, ""])
  }

  const removeFactor = (index: number) => {
    if (factors.length > 2) {
      const newFactors = factors.filter((_, i) => i !== index)
      setFactors(newFactors)
      validateForm(title, newFactors)
    }
  }

  const handleSubmit = () => {
    if (isValid) {
      onComplete({
        title,
        factors: factors.filter(f => f.trim().length > 0)
      })
    }
  }

  return (
    <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
      <div>
        <label className="text-sm font-medium text-slate-300 mb-2 block">
          Decision Title
        </label>
        <Input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="e.g., Should I change careers?"
          className="bg-slate-900 border-slate-600 text-white"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-300 mb-2 block">
          Add at least 2 factors
        </label>
        <div className="space-y-2">
          {factors.map((factor, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={factor}
                onChange={(e) => handleFactorChange(index, e.target.value)}
                placeholder={`Factor ${index + 1} (e.g., Salary, Growth)`}
                className="bg-slate-900 border-slate-600 text-white flex-1"
              />
              {factors.length > 2 && (
                <Button
                  onClick={() => removeFactor(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  ×
                </Button>
              )}
            </div>
          ))}
        </div>
        {factors.length < 5 && (
          <Button
            onClick={addFactor}
            variant="outline"
            size="sm"
            className="mt-2 w-full border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Another Factor
          </Button>
        )}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!isValid}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Check className="h-4 w-4 mr-2" />
        Create My First Decision
      </Button>

      {!isValid && (
        <p className="text-xs text-slate-400 text-center">
          Please enter a title and at least 2 factors
        </p>
      )}
    </div>
  )
}
