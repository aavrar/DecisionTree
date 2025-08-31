"use client"

import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import type { Decision, Factor } from '@/types/decision'

interface DecisionFormState {
  currentStep: number
  totalSteps: number
  decision: Decision
  isValid: boolean[]
  completed: boolean[]
}

type DecisionFormAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'UPDATE_DECISION'; payload: Partial<Decision> }
  | { type: 'SET_STEP_VALID'; payload: { step: number; valid: boolean } }
  | { type: 'SET_STEP_COMPLETED'; payload: { step: number; completed: boolean } }
  | { type: 'RESET_FORM' }

const initialDecision: Decision = {
  id: '',
  title: '',
  description: '',
  factors: [],
  userId: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  status: 'draft'
}

const initialState: DecisionFormState = {
  currentStep: 0,
  totalSteps: 4,
  decision: initialDecision,
  isValid: [false, true, false, true], // Step 2 and 4 are always valid
  completed: [false, false, false, false]
}

function decisionFormReducer(state: DecisionFormState, action: DecisionFormAction): DecisionFormState {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        currentStep: Math.max(0, Math.min(action.payload, state.totalSteps - 1))
      }
    case 'NEXT_STEP':
      if (state.currentStep < state.totalSteps - 1 && state.isValid[state.currentStep]) {
        return {
          ...state,
          currentStep: state.currentStep + 1,
          completed: state.completed.map((c, i) => i === state.currentStep ? true : c)
        }
      }
      return state
    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(0, state.currentStep - 1)
      }
    case 'UPDATE_DECISION':
      return {
        ...state,
        decision: {
          ...state.decision,
          ...action.payload,
          updatedAt: new Date()
        }
      }
    case 'SET_STEP_VALID':
      return {
        ...state,
        isValid: state.isValid.map((v, i) => i === action.payload.step ? action.payload.valid : v)
      }
    case 'SET_STEP_COMPLETED':
      return {
        ...state,
        completed: state.completed.map((c, i) => i === action.payload.step ? action.payload.completed : c)
      }
    case 'RESET_FORM':
      return initialState
    default:
      return state
  }
}

interface DecisionFormContextType {
  state: DecisionFormState
  dispatch: React.Dispatch<DecisionFormAction>
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  updateDecision: (updates: Partial<Decision>) => void
  setStepValid: (step: number, valid: boolean) => void
  setStepCompleted: (step: number, completed: boolean) => void
  resetForm: () => void
  canProceed: boolean
  progressPercentage: number
}

const DecisionFormContext = createContext<DecisionFormContextType | undefined>(undefined)

export function DecisionFormProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(decisionFormReducer, initialState)

  const nextStep = () => dispatch({ type: 'NEXT_STEP' })
  const prevStep = () => dispatch({ type: 'PREV_STEP' })
  const goToStep = (step: number) => dispatch({ type: 'SET_STEP', payload: step })
  const updateDecision = (updates: Partial<Decision>) => 
    dispatch({ type: 'UPDATE_DECISION', payload: updates })
  const setStepValid = (step: number, valid: boolean) => 
    dispatch({ type: 'SET_STEP_VALID', payload: { step, valid } })
  const setStepCompleted = (step: number, completed: boolean) => 
    dispatch({ type: 'SET_STEP_COMPLETED', payload: { step, completed } })
  const resetForm = () => dispatch({ type: 'RESET_FORM' })

  const canProceed = state.isValid[state.currentStep]
  const progressPercentage = ((state.completed.filter(Boolean).length) / state.totalSteps) * 100

  const value: DecisionFormContextType = {
    state,
    dispatch,
    nextStep,
    prevStep,
    goToStep,
    updateDecision,
    setStepValid,
    setStepCompleted,
    resetForm,
    canProceed,
    progressPercentage
  }

  return (
    <DecisionFormContext.Provider value={value}>
      {children}
    </DecisionFormContext.Provider>
  )
}

export function useDecisionForm() {
  const context = useContext(DecisionFormContext)
  if (context === undefined) {
    throw new Error('useDecisionForm must be used within a DecisionFormProvider')
  }
  return context
}