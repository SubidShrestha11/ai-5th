import { useState } from 'react';
import { Film, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Modal, Button, Input } from '@/components/ui';
import { useUIStore } from '@/store/uiStore';
import { useLogin, useRegister } from '@/hooks/queries/auth';
import { ApiError, getErrorMessage } from '@/api/errors';

export function AuthModal() {
  const { authModal, closeAuthModal, openAuthModal, addToast } = useUIStore();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const isLogin = authModal.mode === 'login';
  const loading = loginMutation.isPending || registerMutation.isPending;

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.email.includes('@')) errs.email = 'Valid email required';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (!isLogin && form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const applyApiFieldErrors = (error: unknown) => {
    if (!ApiError.isApiError(error)) return;
    if (Object.keys(error.fieldErrors).length === 0) return;

    const fieldMap: Record<string, string> = {
      confirm_password: 'confirmPassword',
    };

    const mapped = Object.fromEntries(
      Object.entries(error.fieldErrors).map(([key, value]) => [fieldMap[key] ?? key, value])
    );

    setErrors(prev => ({ ...prev, ...mapped }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (isLogin) {
        const user = await loginMutation.mutateAsync({
          email: form.email.trim(),
          password: form.password,
        });
        addToast('success', `Welcome back, ${user.displayName}!`);
      } else {
        const user = await registerMutation.mutateAsync({
          email: form.email.trim(),
          password: form.password,
          confirm_password: form.confirmPassword,
        });
        addToast('success', `Welcome to Letterboxd Lite, ${user.displayName}!`);
      }
      closeAuthModal();
      resetForm();
    } catch (error) {
      applyApiFieldErrors(error);
      if (!ApiError.isApiError(error) || Object.keys(error.fieldErrors).length === 0) {
        addToast('error', getErrorMessage(error));
      }
    }
  };

  const resetForm = () => {
    setForm({ email: '', password: '', confirmPassword: '' });
    setErrors({});
    setShowPass(false);
  };

  const switchMode = () => {
    openAuthModal(isLogin ? 'register' : 'login');
    resetForm();
  };

  return (
    <Modal
      open={authModal.open}
      onClose={() => { closeAuthModal(); resetForm(); }}
      size="sm"
    >
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-300 to-violet-500 flex items-center justify-center shadow-xl shadow-sky-300/20">
            <Film size={22} className="text-[#070B12]" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold font-serif text-white">
              {isLogin ? 'Welcome back' : 'Join the community'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {isLogin
                ? 'Sign in to your cinematic journal'
                : 'Start your cinematic journey today'}
            </p>
          </div>
        </div>

        <div className="w-full flex rounded-lg bg-[#162032] p-1 gap-1">
          <button
            onClick={() => { openAuthModal('login'); resetForm(); }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
              isLogin ? 'bg-[#101827] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => { openAuthModal('register'); resetForm(); }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
              !isLogin ? 'bg-[#101827] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={update('email')}
            error={errors.email}
            icon={<Mail size={15} />}
            autoComplete="email"
            required
          />

          <Input
            label="Password"
            type={showPass ? 'text' : 'password'}
            placeholder="••••••••"
            value={form.password}
            onChange={update('password')}
            error={errors.password}
            icon={<Lock size={15} />}
            iconRight={
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            required
          />

          {!isLogin && (
            <Input
              label="Confirm Password"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              error={errors.confirmPassword}
              icon={<Lock size={15} />}
              autoComplete="new-password"
              required
            />
          )}

          {errors._form && (
            <p className="text-sm text-red-400">{errors._form}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            className="mt-2"
          >
            {isLogin ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        <p className="text-sm text-slate-500 text-center">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={switchMode}
            className="text-sky-400 hover:text-sky-300 font-medium transition-colors cursor-pointer"
          >
            {isLogin ? 'Register' : 'Sign in'}
          </button>
        </p>
      </div>
    </Modal>
  );
}
