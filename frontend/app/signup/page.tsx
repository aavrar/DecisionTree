"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Brain, Target, TrendingUp, Shield, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BackgroundWaves } from "@/components/background-waves"
import { FloatingNetworkCards } from "@/components/floating-network-cards"

const features = [
  {
    icon: Brain,
    title: "Smart Decision Trees",
    description: "Transform complex choices into clear, visual pathways with psychology-informed analysis."
  },
  {
    icon: Target,
    title: "Future Self Reflection",
    description: "Connect with your future self to understand long-term implications of today's decisions."
  },
  {
    icon: TrendingUp,
    title: "Smart Progress Tracking",
    description: "Gamified experience that grows with you, celebrating every decision milestone."
  },
  {
    icon: Shield,
    title: "Stress-Free Interface",
    description: "Calm technology principles reduce decision fatigue and anxiety."
  }
]

export default function SignupPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
      return
    }

    setIsVisible(true)
  }, [session, router])

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    try {
      await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: true
      })
    } catch (error) {
      console.error('Google OAuth error:', error)
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Background elements */}
      <BackgroundWaves />
      <FloatingNetworkCards />

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-white tracking-wide">BRANCHES</span>
          </div>
          <Button
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10 transition-all"
            onClick={() => window.location.href = '/'}
          >
            Already have an account?
          </Button>
        </div>
      </nav>

      {/* Main Content - Center-focused Hero */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className={`text-center space-y-12 ${isVisible ? 'animate-float-up' : 'opacity-0'}`}>

          {/* Hero Content */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-6xl lg:text-7xl font-bold text-white leading-tight">
              Connect and Grow
              <br />
              <span className="text-white">with BRANCHES</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Build better decisions through collaborative networks and data-driven insights.
              Make choices with confidence.
            </p>
          </div>

          {/* CTA Buttons - Side by side */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={handleGoogleSignup}
              disabled={isLoading}
              size="lg"
              className="bg-white text-black font-semibold px-8 py-6 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3" />
              ) : (
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {isLoading ? 'Signing in...' : 'GET STARTED'}
              {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>

            <Button
              onClick={handleGoogleSignup}
              disabled={isLoading}
              size="lg"
              variant="outline"
              className="bg-transparent text-white border-2 border-white/30 font-semibold px-8 py-6 rounded-xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              LOGIN
            </Button>
          </div>

          {/* Privacy Note */}
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            Your data is encrypted and never shared with third parties
          </p>
        </div>
      </div>

      {/* Features Section - "Who our strategy suits" equivalent */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-16">
          Why BRANCHES?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:border-white/40 hover:scale-105 transition-all duration-300 group"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/20 group-hover:bg-white/10 transition-colors">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="relative z-10 text-center pb-20">
        <div className="max-w-2xl mx-auto px-6 space-y-8">
          <div className="space-y-4">
            <h3 className="text-3xl font-bold text-white">
              Ready to Build Better Decisions?
            </h3>
            <p className="text-gray-400 text-lg">
              Join the network of decision makers transforming how they approach choices.
            </p>
          </div>

          <Button
            onClick={handleGoogleSignup}
            disabled={isLoading}
            size="lg"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 px-8 py-6 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
            ) : (
              <Sparkles className="w-5 h-5 mr-2" />
            )}
            {isLoading ? 'Signing in...' : 'Start Your Journey'}
          </Button>
        </div>
      </div>
    </div>
  )
}
