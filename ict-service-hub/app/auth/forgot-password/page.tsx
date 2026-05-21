'use client'
// app/auth/forgot-password/page.tsx

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/schemas'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Button, Field, Input, Alert } from '@/components/ui'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    setServerError(null)
    const supabase = createSupabaseBrowserClient()

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setServerError('Could not send reset email. Please try again.')
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-liturgical-white flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center bg-white rounded-card border border-green-200 shadow-card p-10">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="font-display text-2xl font-bold text-navy-950 mb-2">Reset Link Sent</h2>
          <p className="text-slate-600 mb-6">
            If that email is registered, you will receive a password reset link shortly. Check your inbox and spam folder.
          </p>
          <Link href="/auth/login" className="inline-flex items-center gap-2 bg-navy-950 text-white px-6 py-3 rounded-btn font-semibold hover:bg-navy-800 transition-colors">
            Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-liturgical-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-gold-600 font-bold text-xs tracking-widest uppercase mb-1">Diocese of Kalookan</p>
          <h1 className="font-display text-2xl font-bold text-navy-950">Forgot Password</h1>
          <p className="text-slate-500 mt-2">Enter your email to receive a reset link</p>
        </div>

        <div className="bg-white rounded-card border border-liturgical-muted shadow-card p-8">
          {serverError && (
            <div className="mb-5">
              <Alert variant="error" onDismiss={() => setServerError(null)}>{serverError}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <Field label="Email Address" htmlFor="email" error={errors.email?.message} required>
              <Input id="email" type="email" placeholder="you@dioceseofkalookan.org" error={!!errors.email} {...register('email')} />
            </Field>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send Reset Link'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Remembered it?{' '}
            <Link href="/auth/login" className="text-gold-600 hover:text-gold-700 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
