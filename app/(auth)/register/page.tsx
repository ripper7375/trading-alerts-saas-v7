'use client';

import Link from 'next/link';

import RegisterForm from '@/components/auth/register-form';

export default function RegisterPage(): JSX.Element {
  return (
    <div className="space-y-6">
      <RegisterForm />
      <div className="text-center text-sm">
        <span className="text-gray-600">Already have an account? </span>
        <Link
          href="/login"
          className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}