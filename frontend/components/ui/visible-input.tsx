import * as React from "react"

interface VisibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

function VisibleInput({ className, ...props }: VisibleInputProps) {
  return (
    <input
      {...props}
      style={{
        color: '#000000',
        backgroundColor: '#ffffff',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '14px',
        width: '100%',
        outline: 'none',
        ...props.style
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#3b82f6'
        e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)'
        props.onFocus?.(e)
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#d1d5db'
        e.target.style.boxShadow = 'none'
        props.onBlur?.(e)
      }}
    />
  )
}

export { VisibleInput }