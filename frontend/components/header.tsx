"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Search, Bell, User, Zap, LogOut } from "lucide-react"
import { signOut, useSession } from "next-auth/react"

const navItems = [
  { name: "New Decision", href: "#", active: false, icon: Zap },
  { name: "My Decisions", href: "#", active: true, icon: null },
  { name: "Insights", href: "#", active: false, icon: null },
  { name: "Profile", href: "#", active: false, icon: User },
]

export function Header() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [notifications, setNotifications] = useState(3)

  const handleLogout = () => {
    // Clear auth token from localStorage
    localStorage.removeItem('authToken')
    localStorage.removeItem('hasSeenOnboarding')
    // Sign out from NextAuth
    signOut({ callbackUrl: '/' })
  }

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <header className="sticky top-0 z-50 glassmorphism border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="h-8 w-32 skeleton rounded-lg"></div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 w-20 skeleton rounded"></div>
              ))}
            </nav>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 skeleton rounded-full"></div>
              <div className="h-8 w-8 skeleton rounded-full"></div>
              <div className="h-8 w-8 skeleton rounded-full"></div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 glassmorphism-strong border-b animate-float-up">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Enhanced Logo */}
          <div className="flex items-center hover-tilt">
            <div className="relative">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Branches
              </h1>
            </div>
          </div>

          {/* Enhanced Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => {
              const Icon = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 hover-glow rounded-lg spotlight ${
                    item.active ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-1">
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{item.name}</span>
                  </div>
                  {item.active && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse-glow" />
                  )}
                  <div className="absolute inset-0 bg-primary/5 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 -z-10"></div>
                </a>
              )
            })}
          </nav>

          {/* Enhanced Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex hover:scale-110 transition-all duration-300 btn-magnetic glassmorphism-subtle"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Notifications with Badge */}
            <Button
              variant="ghost"
              size="sm"
              className="relative hover:scale-110 transition-all duration-300 btn-magnetic glassmorphism-subtle"
            >
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce-subtle">
                  {notifications}
                </div>
              )}
            </Button>

            {/* Profile Button */}
            <Button
              variant="ghost"
              size="sm"
              className="hover:scale-110 transition-all duration-300 btn-magnetic glassmorphism-subtle"
            >
              <div className="w-6 h-6 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                <User className="h-3 w-3 text-white" />
              </div>
            </Button>

            {/* Logout Button */}
            {session && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="hover:scale-110 transition-all duration-300 btn-magnetic glassmorphism-subtle text-muted-foreground hover:text-red-500"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden hover:scale-110 transition-all duration-300 btn-magnetic"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className="relative">
                {mobileMenuOpen ? <X className="h-5 w-5 animate-spin" /> : <Menu className="h-5 w-5" />}
              </div>
            </Button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t glassmorphism-subtle animate-slide-down">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 rounded-lg spotlight flex items-center space-x-2 ${
                      item.active
                        ? "text-primary bg-primary/10 animate-pulse-glow"
                        : "text-muted-foreground hover:text-primary hover:bg-accent/5"
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{item.name}</span>
                    {item.active && (
                      <div className="ml-auto w-2 h-2 bg-primary rounded-full animate-bounce-subtle"></div>
                    )}
                  </a>
                )
              })}

              {/* Mobile-only search */}
              <div className="px-3 py-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search decisions..."
                    className="w-full pl-10 pr-4 py-2 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 glassmorphism-subtle"
                  />
                </div>
              </div>

              {/* Mobile logout button */}
              {session && (
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 rounded-lg flex items-center space-x-2 text-muted-foreground hover:text-red-500 hover:bg-red-50/5"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              )}
            </nav>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary progress-shimmer"></div>
    </header>
  )
}
