"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Check, Eye, EyeOff, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

const registrationSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    agreedToTerms: z.boolean().refine((val) => val === true, "You must agree to terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type RegistrationFormData = z.infer<typeof registrationSchema>

export default function RegistrationForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, touchedFields, isValid },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  })

  const password = watch("password", "")
  const name = watch("name", "")
  const email = watch("email", "")
  const confirmPassword = watch("confirmPassword", "")
  const agreedToTerms = watch("agreedToTerms", false)

  const passwordRequirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  }

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log("Form submitted:", data)
    setIsLoading(false)
    setIsSuccess(true)

    // Simulate redirect
    setTimeout(() => {
      console.log("Redirecting to dashboard...")
    }, 2000)
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md bg-white shadow-xl rounded-xl p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account created successfully!</h2>
            <p className="text-gray-600">Redirecting to dashboard...</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md bg-white shadow-xl rounded-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">Create Your Account</h1>
        <p className="text-gray-600 text-center mb-8">Start trading smarter today</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name Input */}
          <div>
            <Label htmlFor="name" className="font-medium text-gray-700">
              Full Name
            </Label>
            <div className="relative mt-1">
              <Input
                id="name"
                type="text"
                placeholder="John Trader"
                {...register("name")}
                className={`pr-10 transition-all duration-200 ${
                  errors.name
                    ? "border-red-500 focus:ring-red-500"
                    : touchedFields.name && !errors.name
                      ? "border-green-500 focus:ring-green-500"
                      : ""
                }`}
              />
              {touchedFields.name && !errors.name && name.length >= 2 && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
              )}
            </div>
            {errors.name && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <Label htmlFor="email" className="font-medium text-gray-700">
              Email Address
            </Label>
            <div className="relative mt-1">
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                {...register("email")}
                className={`pr-10 transition-all duration-200 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : touchedFields.email && !errors.email
                      ? "border-green-500 focus:ring-green-500"
                      : ""
                }`}
              />
              {touchedFields.email && !errors.email && email.includes("@") && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
              )}
            </div>
            {errors.email && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <Label htmlFor="password" className="font-medium text-gray-700">
              Password
            </Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className="pr-10 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Requirements */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm">
                {passwordRequirements.minLength ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className={passwordRequirements.minLength ? "text-green-600" : "text-gray-600"}>
                  At least 8 characters
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {passwordRequirements.hasUppercase ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className={passwordRequirements.hasUppercase ? "text-green-600" : "text-gray-600"}>
                  One uppercase letter
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {passwordRequirements.hasLowercase ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className={passwordRequirements.hasLowercase ? "text-green-600" : "text-gray-600"}>
                  One lowercase letter
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {passwordRequirements.hasNumber ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className={passwordRequirements.hasNumber ? "text-green-600" : "text-gray-600"}>One number</span>
              </div>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <Label htmlFor="confirmPassword" className="font-medium text-gray-700">
              Confirm Password
            </Label>
            <div className="relative mt-1">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("confirmPassword")}
                className={`pr-10 transition-all duration-200 ${
                  errors.confirmPassword
                    ? "border-red-500 focus:ring-red-500"
                    : touchedFields.confirmPassword &&
                        !errors.confirmPassword &&
                        confirmPassword === password &&
                        confirmPassword.length > 0
                      ? "border-green-500 focus:ring-green-500"
                      : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {touchedFields.confirmPassword &&
                !errors.confirmPassword &&
                confirmPassword === password &&
                confirmPassword.length > 0 && (
                  <Check className="absolute right-10 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                )}
            </div>
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Checkbox id="agreedToTerms" {...register("agreedToTerms")} className="mt-1" />
              <Label htmlFor="agreedToTerms" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-blue-600 underline hover:text-blue-700">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 underline hover:text-blue-700">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {errors.agreedToTerms && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.agreedToTerms.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-lg transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed min-h-[44px]"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        {/* Footer Links */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Login
            </Link>
          </p>
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-gray-300">—</span>
            <Link href="/forgot-password" className="text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
