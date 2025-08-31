"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Brain, Sparkles, Target, TrendingUp, Users, Shield, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassmorphicCard, GlassmorphicCardContent, GlassmorphicCardHeader, GlassmorphicCardTitle } from "@/components/ui/glassmorphic-card"
import { Badge } from "@/components/ui/badge"

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

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Manager",
    quote: "Branches helped me navigate my career pivot with confidence. The future self feature was a game-changer."
  },
  {
    name: "Marcus Rodriguez",
    role: "Entrepreneur",
    quote: "I make better business decisions 3x faster. The suggestions are incredibly insightful."
  },
  {
    name: "Dr. Emily Watson",
    role: "Behavioral Psychologist",
    quote: "Finally, a decision-making tool grounded in actual psychology research. My clients love it."
  }
]

export default function SignupPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (session) {
      router.push('/dashboard')
      return
    }
    
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
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

  // Show loading if checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-400 animate-pulse" />
            <span className="text-2xl font-bold text-white">Branches</span>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 animate-pulse">
              Beta 2025
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            className="text-white/70 hover:text-white hover:scale-105 transition-all"
            onClick={() => window.location.href = '/'}
          >
            Already have an account?
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Hero Content */}
          <div className={`space-y-8 ${isVisible ? 'animate-float-up' : 'opacity-0'}`}>
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                Make Better
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent animate-pulse">
                  {" "}Decisions
                </span>
              </h1>
              <p className="text-xl text-white/70 leading-relaxed">
                Transform complex choices into clear paths forward with decision trees, 
                future self reflection, and psychology-informed guidance.
              </p>
            </div>

            {/* Key Benefits */}
            <div className="flex flex-wrap gap-3">
              {["🧠 Psychology-Based", "⚡ Lightning Fast", "📊 Data-Driven", "🔒 Private & Secure"].map((benefit, index) => (
                <Badge 
                  key={index} 
                  className="bg-white/10 text-white border-white/20 px-4 py-2 animate-pulse hover:scale-105 transition-transform"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  {benefit}
                </Badge>
              ))}
            </div>

            {/* CTA Button */}
            <div className="space-y-4">
              <Button
                onClick={handleGoogleSignup}
                disabled={isLoading}
                size="lg"
                className="w-full lg:w-auto bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 hover:from-blue-600 hover:via-purple-600 hover:to-green-600 text-white font-semibold px-8 py-4 rounded-xl shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                ) : (
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                {isLoading ? 'Signing in...' : 'Continue with Google'}
                {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
              </Button>
              <p className="text-sm text-white/50 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Your data is encrypted and never shared with third parties
              </p>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 text-white/60">
              <div className="flex -space-x-2">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full border-2 border-slate-900" />
                ))}
              </div>
              <span className="text-sm">Join 10,000+ decision makers</span>
            </div>
          </div>

          {/* Right Column - Feature Cards & Testimonials */}
          <div className={`space-y-6 ${isVisible ? 'animate-float-up delay-300' : 'opacity-0'}`}>
            
            {/* Feature Grid */}
            <div className="grid gap-4">
              {features.map((feature, index) => (
                <GlassmorphicCard
                  key={index}
                  className="hover:scale-105 transition-all duration-300 cursor-pointer"
                  progressiveReveal={true}
                  revealDelay={index * 150}
                  emotionalState="confident"
                >
                  <GlassmorphicCardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                        <feature.icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                        <p className="text-sm text-white/70 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </GlassmorphicCardContent>
                </GlassmorphicCard>
              ))}
            </div>

            {/* Rotating Testimonial */}
            <GlassmorphicCard className="relative overflow-hidden">
              <GlassmorphicCardHeader>
                <GlassmorphicCardTitle className="flex items-center gap-2 text-white">
                  <Users className="w-5 h-5 text-green-400" />
                  What Our Users Say
                </GlassmorphicCardTitle>
              </GlassmorphicCardHeader>
              <GlassmorphicCardContent>
                <div className="relative h-24">
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-500 ${
                        index === currentTestimonial 
                          ? 'opacity-100 transform translate-y-0' 
                          : 'opacity-0 transform translate-y-4'
                      }`}
                    >
                      <blockquote className="text-white/80 italic mb-3">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full" />
                        <div>
                          <p className="text-sm font-medium text-white">{testimonial.name}</p>
                          <p className="text-xs text-white/60">{testimonial.role}</p>
                        </div>
                        <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassmorphicCardContent>
            </GlassmorphicCard>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { number: "10k+", label: "Users" },
                { number: "50k+", label: "Decisions" },
                { number: "95%", label: "Satisfaction" }
              ].map((stat, index) => (
                <GlassmorphicCard key={index} className="text-center">
                  <GlassmorphicCardContent className="p-4">
                    <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                    <div className="text-sm text-white/60">{stat.label}</div>
                  </GlassmorphicCardContent>
                </GlassmorphicCard>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative z-10 text-center pb-12">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-white/60 mb-6">
            Ready to make decisions with confidence? Join thousands who've transformed their choice-making process.
          </p>
          <Button
            onClick={handleGoogleSignup}
            disabled={isLoading}
            size="lg"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 px-8 py-3 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
            ) : (
              <Sparkles className="w-5 h-5 mr-2" />
            )}
            {isLoading ? 'Signing in...' : 'Start Your Decision Journey'}
          </Button>
        </div>
      </div>
    </div>
  )
}