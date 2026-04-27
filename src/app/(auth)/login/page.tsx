'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const router = useRouter();
  const { notify } = useToast();

  const handlePasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }

      notify('Signed in successfully.', 'success');
      router.replace('/workflows');
      router.refresh();
    } catch {
      notify('Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    setMagicLoading(true);

    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/api/auth/callback`
        }
      });

      if (error) {
        throw error;
      }

      notify('Magic link sent. Check your email inbox.', 'success');
    } catch {
      notify('Unable to send magic link right now.', 'error');
    } finally {
      setMagicLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f9fb] p-6">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in with your account credentials.</p>

        <form className="mt-6 space-y-4" onSubmit={handlePasswordLogin}>
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
            />
          </div>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? <Spinner /> : 'Sign In'}
          </Button>
        </form>

        <div className="mt-3">
          <Button
            type="button"
            className="w-full bg-white text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"
            onClick={handleMagicLink}
            disabled={magicLoading || !email}
          >
            {magicLoading ? <Spinner className="border-brand-300 border-t-brand-700" /> : 'Send Magic Link'}
          </Button>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          New here?{' '}
          <a href="/signup" className="font-medium text-brand-700 hover:text-brand-600">
            Create account
          </a>
        </p>
      </Card>
    </main>
  );
}
