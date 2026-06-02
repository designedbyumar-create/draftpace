'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const BoltIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" fill="white" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
)

const ArrowRight = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
)

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export default function Signup() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const emailFromUrl = searchParams.get('email')
    if (emailFromUrl) {
      setEmail(emailFromUrl)
      setStep(2)
    }
  }, [searchParams])

  const handleSignup = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name || email.split('@')[0] },
      },
    })
    setLoading(false)
    if (error) {
      setError(error.message || "Something went wrong — please try again")
      return
    }
    router.push('/dashboard')
  }

  const handleGoogle = () => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  const stepTitles = [
    "What's your email?",
    "Create a password",
    "What should we call you?",
  ]

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative"
      style={{
        background: "#fafaf9",
        backgroundImage: `linear-gradient(#e8e8e6 1px, transparent 1px), linear-gradient(90deg, #e8e8e6 1px, transparent 1px)`,
        backgroundSize: "44px 44px",
      }}
    >

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-10">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
          <BoltIcon size={15} />
        </div>
        <span className="text-[16px] font-bold text-gray-950">Draftpace</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-3xl shadow-sm p-8">

        {/* Progress dots */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="transition-all duration-300 rounded-full"
              style={{
                height: "6px",
                width: s === step ? "24px" : "6px",
                background: s <= step ? "#4f46e5" : "#e5e7eb",
              }}
            />
          ))}
          <span className="text-[11px] text-gray-400 ml-1">Step {step} of 3</span>
        </div>

        {/* Title */}
        <h1
          className="font-black text-gray-950 mb-1"
          style={{ fontSize: "clamp(22px, 5vw, 26px)", letterSpacing: "-0.03em" }}
        >
          {stepTitles[step - 1]}
        </h1>

        {/* Step 1 — Email */}
        {step === 1 && (
          <div className="mt-6">
            <div className="mb-4">
              <label className="block text-[12px] font-semibold text-gray-600 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && email && setStep(2)}
                placeholder="you@example.com"
                autoFocus
                className="w-full h-[52px] bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 text-[15px] text-gray-900 placeholder-gray-400 transition-all"
              />
            </div>

            <button
              onClick={() => email && setStep(2)}
              disabled={!email}
              className="w-full h-[52px] bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-[15px] mb-5"
            >
              Continue <ArrowRight size={14} />
            </button>

            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-[12px] text-gray-400">or</span>
              </div>
            </div>

            <button
              onClick={handleGoogle}
              className="w-full h-[52px] bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-3 text-[14px] transition-all"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <p className="text-center text-[13px] text-gray-400 mt-5">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        )}

        {/* Step 2 — Password */}
        {step === 2 && (
          <div className="mt-6">
            <p className="text-[13px] text-gray-400 mb-5">
              For <span className="font-semibold text-gray-700">{email}</span>
            </p>

            <div className="mb-4">
              <label className="block text-[12px] font-semibold text-gray-600 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && password.length >= 8 && setStep(3)}
                  placeholder="Min. 8 characters"
                  autoFocus
                  className="w-full h-[52px] bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 pr-12 text-[15px] text-gray-900 placeholder-gray-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {/* Password strength */}
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all"
                        style={{
                          background: password.length >= i * 4
                            ? i === 1 ? "#f97316"
                            : i === 2 ? "#f59e0b"
                            : "#22c55e"
                            : "#e5e7eb"
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400">
                    {password.length < 4 ? "Weak" : password.length < 8 ? "Fair" : "Strong"}
                  </span>
                </div>
              )}
            </div>

            {error && (
              <p className="text-[13px] text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
                {error}
              </p>
            )}

            <button
              onClick={() => password.length >= 8 && setStep(3)}
              disabled={password.length < 8}
              className="w-full h-[52px] bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-[15px]"
            >
              Continue <ArrowRight size={14} />
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full mt-3 text-[13px] text-gray-400 hover:text-gray-600 py-2 transition-colors"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step 3 — Name */}
        {step === 3 && (
          <div className="mt-6">
            <p className="text-[13px] text-gray-400 mb-5">
              Optional — we'll use your email name if you skip.
            </p>

            <div className="mb-5">
              <label className="block text-[12px] font-semibold text-gray-600 mb-2">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
                placeholder="e.g. Jamie"
                autoFocus
                className="w-full h-[52px] bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 text-[15px] text-gray-900 placeholder-gray-400 transition-all"
              />
            </div>

            {error && (
              <p className="text-[13px] text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
                {error}
              </p>
            )}

            {/* What you get */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-5">
              <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-widest mb-3">
                You're getting
              </p>
              <div className="flex flex-col gap-2">
                {[
                  "3 free planners — forever",
                  "Streak tracking from day 1",
                  "Progress dashboard",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-indigo-100 flex items-center justify-center shrink-0">
                      <CheckIcon />
                    </div>
                    <span className="text-[13px] text-indigo-800 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full h-[52px] bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-[15px] mb-3"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Setting up your account...
                </>
              ) : (
                <>Take me to my planners <ArrowRight size={14} /></>
              )}
            </button>

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full text-[13px] text-gray-400 hover:text-gray-600 py-2 transition-colors"
            >
              Skip — use my email name
            </button>
          </div>
        )}

      </div>

      {/* Footer */}
      <p className="text-[11px] text-gray-400 mt-6 text-center">
        By signing up you agree to our{' '}
        <Link href="/terms" className="underline hover:text-gray-600">Terms</Link>
        {' '}and{' '}
        <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
      </p>

    </div>
  )
}