'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@elymica/ui';

interface FormState {
  email: string;
  password: string;
  tenant: string;
}

const initialState: FormState = {
  email: '',
  password: '',
  tenant: '',
};

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') ?? '/';
  const [values, setValues] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const response = await signIn('credentials', {
      email: values.email,
      password: values.password,
      tenant: values.tenant,
      redirect: false,
      callbackUrl,
    });

    setIsSubmitting(false);

    if (response?.error || !response?.ok) {
      setError('Unable to sign in. Check your school code and credentials.');
      return;
    }

    router.push(response.url ?? '/');
  }

  function updateValue(field: keyof FormState, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-2xl border border-sage/20 bg-white/90 p-8 shadow-xl shadow-sand/40 backdrop-blur"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-olive">Parent access</p>
        <h1 className="mt-2 font-heading text-3xl text-night">Monitor your child</h1>
        <p className="mt-2 text-sm text-olive">
          Use the credentials shared by your school to follow progress, attendance, and reports.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-night" htmlFor="tenant">
          School Code
        </label>
        <input
          id="tenant"
          name="tenant"
          required
          value={values.tenant}
          onChange={(event) => updateValue('tenant', event.target.value.trim())}
          placeholder="e.g. sunrise-academy"
          className="w-full rounded-lg border border-sage/40 bg-white px-4 py-3 text-night outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/30"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-night" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={values.email}
          onChange={(event) => updateValue('email', event.target.value)}
          placeholder="parent@school.com"
          className="w-full rounded-lg border border-sage/40 bg-white px-4 py-3 text-night outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/30"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-night" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={values.password}
          onChange={(event) => updateValue('password', event.target.value)}
          className="w-full rounded-lg border border-sage/40 bg-white px-4 py-3 text-night outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/30"
        />
      </div>

      {error ? (
        <p className="rounded-lg border border-terracotta/30 bg-terracotta/10 px-3 py-2 text-sm text-terracotta">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
