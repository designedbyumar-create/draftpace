'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowRight, Envelope, Lock, WarningCircle } from '@/design-system/Icon'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export default function Login() {
  const router = useRouter()
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError("Wrong email or password — double check and try again."); return }
    router.push('/app')
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div
      className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 sm:px-6 py-8 relative"
      style={{
        background: "#fafaf9",
        backgroundImage: `linear-gradient(#e8e8e6 1px, transparent 1px), linear-gradient(90deg, #e8e8e6 1px, transparent 1px)`,
        backgroundSize: "44px 44px",
      }}
    >
      {/* Card */}
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">

        <div className="h-1 w-full bg-indigo-600"/>

        <div className="p-6 sm:p-8">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-[22px] sm:text-[26px] font-black text-gray-950 mb-1.5 leading-tight"
              style={{ letterSpacing: "-0.03em" }}>
              Welcome back
            </h1>
            <p className="text-[14px] text-gray-400">Sign in to your Draftpace account</p>
          </div>

          {/* Google — top because it's faster */}
          <button onClick={handleGoogle}
            className="w-full h-[50px] bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-3 text-[14px] transition-all mb-5">
            <GoogleIcon/> Continue with Google
          </button>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"/>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[12px] text-gray-400">or sign in with email</span>
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-[12px] font-semibold text-gray-600 mb-2">Email address</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Envelope size={15} className="text-gray-400" />
              </div>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="you@example.com"
                autoComplete="email" autoFocus
                className="w-full h-[50px] bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded-xl pl-11 pr-4 text-[15px] text-gray-900 placeholder-gray-400 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[12px] font-semibold text-gray-600">Password</label>
              <Link href="/forgot-password"
                className="text-[12px] text-indigo-600 font-semibold hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Lock size={15} className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Your password"
                autoComplete="current-password"
                className="w-full h-[50px] bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded-xl pl-11 pr-14 text-[15px] text-gray-900 placeholder-gray-400 transition-all"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-gray-400 hover:text-gray-600 transition-colors">
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
              <WarningCircle size={14} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-[13px] text-red-600">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button onClick={handleLogin} disabled={loading || !email || !password}
            className="w-full h-[50px] bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-[15px]">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Signing in...</>
            ) : (
              <>Sign in <ArrowRight size={14}/></>
            )}
          </button>

          <p className="text-center text-[13px] text-gray-400 mt-5">
            Don't have an account?{' '}
            <Link href="/signup" className="text-indigo-600 font-semibold hover:underline">Sign up free</Link>
          </p>

        </div>
      </div>

      <p className="text-[11px] text-gray-400 mt-5 text-center">
        By signing in you agree to our{' '}
        <Link href="/terms" className="underline hover:text-gray-600">Terms</Link>
        {' '}and{' '}
        <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
      </p>

    </div>
  )
}
