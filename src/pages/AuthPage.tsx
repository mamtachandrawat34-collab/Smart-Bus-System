import { useState } from 'react';
import { Bus, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { FieldWrapper, TextInput } from '@/components/ui/Field';
import { cn } from '@/lib/cn';

type Mode = 'signin' | 'signup';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const { pushToast } = useToast();

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError(null);
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setBusy(true);
    if (mode === 'signin') {
      const res = await signIn(email.trim(), password);
      setBusy(false);
      if (res.error) {
        setError(res.error);
        return;
      }
      pushToast({ variant: 'success', title: 'Signed in', message: 'Welcome back.' });
    } else {
      const res = await signUp(email.trim(), password, displayName.trim());
      setBusy(false);
      if (res.error) {
        setError(res.error);
        return;
      }
      pushToast({
        variant: 'success',
        title: 'Account created',
        message: 'You are now signed in.',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a1a35] via-[#0f1f3d] to-[#13274a] p-4">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-500/20">
            <Bus size={28} />
          </div>
          <h1 className="text-xl font-bold text-white">Smart College Bus</h1>
          <p className="mt-0.5 text-sm text-blue-200/70">Management System</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white p-6 shadow-2xl sm:p-8">
          <div className="mb-5 flex gap-2 rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition',
                mode === 'signin'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <LogIn size={16} /> Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition',
                mode === 'signup'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <UserPlus size={16} /> Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === 'signup' && (
              <FieldWrapper
                label="Display Name (optional)"
                htmlFor="name"
                hint="This is how your name will appear to admins."
              >
                <TextInput
                  id="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Aman Sharma"
                  autoComplete="name"
                />
              </FieldWrapper>
            )}

            <FieldWrapper label="Email" htmlFor="email" required>
              <TextInput
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                autoComplete="email"
                aria-invalid={!!error}
              />
            </FieldWrapper>

            <FieldWrapper label="Password" htmlFor="password" required>
              <div className="relative">
                <TextInput
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  className="pr-10"
                  aria-invalid={!!error}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FieldWrapper>

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}

            <Button type="submit" disabled={busy} className="w-full" size="lg">
              {busy
                ? 'Please wait…'
                : mode === 'signin'
                ? 'Sign In'
                : 'Create Account'}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">
            Students can sign up directly. Admin access is assigned separately
            and cannot be self-selected.
          </p>
        </div>
      </div>
    </div>
  );
}
