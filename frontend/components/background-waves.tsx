"use client"

export function BackgroundWaves() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Subtle wave patterns - very dark gray on black */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 800"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Wave 1 - Top */}
        <path
          d="M0,100 Q360,50 720,100 T1440,100 L1440,0 L0,0 Z"
          fill="#1a1a1a"
          opacity="0.3"
        >
          <animate
            attributeName="d"
            dur="20s"
            repeatCount="indefinite"
            values="
              M0,100 Q360,50 720,100 T1440,100 L1440,0 L0,0 Z;
              M0,80 Q360,120 720,80 T1440,80 L1440,0 L0,0 Z;
              M0,100 Q360,50 720,100 T1440,100 L1440,0 L0,0 Z
            "
          />
        </path>

        {/* Wave 2 - Middle */}
        <path
          d="M0,400 Q360,350 720,400 T1440,400 L1440,800 L0,800 Z"
          fill="#0d0d0d"
          opacity="0.5"
        >
          <animate
            attributeName="d"
            dur="25s"
            repeatCount="indefinite"
            values="
              M0,400 Q360,350 720,400 T1440,400 L1440,800 L0,800 Z;
              M0,420 Q360,380 720,420 T1440,420 L1440,800 L0,800 Z;
              M0,400 Q360,350 720,400 T1440,400 L1440,800 L0,800 Z
            "
          />
        </path>

        {/* Wave 3 - Bottom curve */}
        <path
          d="M0,600 Q360,550 720,600 T1440,600 L1440,800 L0,800 Z"
          fill="#1a1a1a"
          opacity="0.2"
        >
          <animate
            attributeName="d"
            dur="30s"
            repeatCount="indefinite"
            values="
              M0,600 Q360,550 720,600 T1440,600 L1440,800 L0,800 Z;
              M0,620 Q360,570 720,620 T1440,620 L1440,800 L0,800 Z;
              M0,600 Q360,550 720,600 T1440,600 L1440,800 L0,800 Z
            "
          />
        </path>
      </svg>

      {/* Floating subtle circles */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl animate-pulse"
           style={{ animationDuration: '8s' }} />
      <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl animate-pulse"
           style={{ animationDuration: '10s', animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-white/[0.01] rounded-full blur-3xl animate-pulse"
           style={{ animationDuration: '12s', animationDelay: '4s' }} />
    </div>
  )
}
