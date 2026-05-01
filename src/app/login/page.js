'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2, CheckCircle2, ShieldCheck, User as UserIcon } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('member') // 'admin' or 'member'
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [mode, setMode] = useState('login') // 'login' or 'signup'

  const handleAuth = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      } else {
        // Sign up with role metadata
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              role: role // This is picked up by the Supabase trigger
            }
          },
        })
        if (error) throw error
        setMessage('Check your email for the confirmation link.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden transition-colors duration-300">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 font-bold text-xl text-foreground z-10">

        TaskFlow
      </Link>
      
      <Card className="w-full max-w-md backdrop-blur-xl bg-card/70 border-border shadow-2xl z-10 animate-in fade-in zoom-in duration-500">
        <CardHeader className="space-y-2 text-center pb-8">
          <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">
            {mode === 'login' ? 'Welcome back' : 'Join TaskFlow'}
          </CardTitle>
          <CardDescription className="text-muted-foreground font-medium">
            {mode === 'login' 
              ? 'Access your workspace and team' 
              : 'Choose your role and start building today'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-in slide-in-from-top-1">
                <AlertCircle className="size-4 shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}
            
            {message && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-500 px-4 py-3 rounded-xl flex items-center gap-3 text-sm animate-in slide-in-from-top-1">
                <CheckCircle2 className="size-4 shrink-0" />
                <p className="font-medium">{message}</p>
              </div>
            )}

            {/* Role Selection (Only for Signup) */}
            {mode === 'signup' && (
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Select Your Role</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('member')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      role === 'member' 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80'
                    }`}
                  >
                    <UserIcon className="size-4" />
                    <span className="text-sm font-bold">Member</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      role === 'admin' 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80'
                    }`}
                  >
                    <ShieldCheck className="size-4" />
                    <span className="text-sm font-bold">Admin</span>
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="h-12 bg-muted/30 border-border focus:bg-background transition-all rounded-xl shadow-inner" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" title="password" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Password</Label>
                {mode === 'login' && (
                  <Link href="#" className="text-[10px] font-black uppercase text-primary hover:opacity-80 tracking-tighter">
                    Forgot?
                  </Link>
                )}
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="h-12 bg-muted/30 border-border focus:bg-background transition-all rounded-xl shadow-inner" 
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 text-base font-bold shadow-xl shadow-primary/20 rounded-xl bg-primary hover:opacity-95 active:scale-[0.98] transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-2 pb-8">
          <div className="text-center text-sm text-muted-foreground font-medium">
            {mode === 'login' ? (
              <>
                New to TaskFlow?{" "}
                <button 
                  onClick={() => setMode('signup')}
                  className="font-bold text-primary hover:underline decoration-2 underline-offset-4"
                >
                  Create account
                </button>
              </>
            ) : (
              <>
                Joined already?{" "}
                <button 
                  onClick={() => setMode('login')}
                  className="font-bold text-primary hover:underline decoration-2 underline-offset-4"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
