'use client'
// app/auth/reset-password/page.tsx

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/schemas'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Button, Field, Input, Alert } from '@/components/ui'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError(null)
    const supabase = createSupabaseBrowserClient()

    const { error } = await supabase.auth.updateUser({ password: data.password })

    if (error) {
      setServerError('Could not reset password. The link may have expired. Please request a new one.')
      return
    }

    router.push('/auth/login?reset=success')
  }

  return (
    <div className="min-h-screen bg-liturgical-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-gold-600 font-bold text-xs tracking-widest uppercase mb-1">Diocese of Kalookan</p>
          <h1 className="font-display text-2xl font-bold text-navy-950">Set New Password</h1>
          <p className="text-slate-500 mt-2">Choose a strong password for your account</p>
        </div>

        <div className="bg-white rounded-card border border-liturgical-muted shadow-card p-8">
          {serverError && (
            <div className="mb-5">
              <Alert variant="error" onDismiss={() => setServerError(null)}>{serverError}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <Field label="New Password" htmlFor="password" error={errors.password?.message}
              hint="At least 6 characters, one uppercase letter, one number" required>
              <Input id="password" type="password" autoComplete="new-password" placeholder="New password" error={!!errors.password} {...register('password')} />
            </Field>

            <Field label="Confirm New Password" htmlFor="confirm_password" error={errors.confirm_password?.message} required>
              <Input id="confirm_password" type="password" autoComplete="new-password" placeholder="Repeat new password" error={!!errors.confirm_password} {...register('confirm_password')} />
            </Field>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
              {isSubmitting ? 'Updating…' : 'Update Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
