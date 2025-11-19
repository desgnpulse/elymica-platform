import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Parent Sign In | Elymica',
};

export default function LoginPage() {
  return (
    <main className="relative min-h-screen bg-sand">
      <div className="absolute inset-0 bg-gradient-to-br from-sand via-white to-terracotta/25" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 py-16">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-olive">Elymica</p>
          <h1 className="mt-2 font-heading text-4xl text-night">Stay connected to every lesson</h1>
        </div>
        <div className="w-full max-w-xl">
          <LoginForm />
          <p className="mt-6 text-center text-sm text-olive">
            Need access?{' '}
            <Link href="mailto:support@elymica.com" className="font-medium text-sage underline-offset-4 hover:underline">
              Contact your school admin
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
