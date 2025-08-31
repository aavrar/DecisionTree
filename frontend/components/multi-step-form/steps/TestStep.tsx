"use client"

import React from 'react'

export function TestStep() {
  console.log('TestStep rendering!')
  
  return (
    <div className="p-8 bg-white/10 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Test Step Component</h2>
      <p className="text-white/70">If you can see this, the step components are working!</p>
    </div>
  )
}