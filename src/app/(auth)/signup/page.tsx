'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { notify } = useToast();

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/api/auth/callback`
        }
      });

      if (error) {
        throw error;
      }

      notify('Account created. Check your email to confirm.', 'success');
      router.replace('/login');
    } catch {
      notify('Sign-up failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f9fb] p-6">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Create account</h1>
        <p className="mt-1 text-sm text-gray-500">Start building automated document workflows.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSignup}>
          <div className="space-y-1">
            <label className="text-sm text-gray-500" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-500" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? <Spinner /> : 'Create Account'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-brand-700 hover:text-brand-600">
            Sign in
          </a>
        </p>
      </Card>
    </main>
  );
}
