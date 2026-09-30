import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from '@tanstack/react-router';
import { useAuth } from '@/shared/AuthContext';
import { LogIn, Loader2, Shield, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { fadeUp, scaleIn } from '@/lib/animations';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await login(formData.email, formData.password);
      navigate({ to: '/' });
    } catch (error: any) {
      setErrors({ submit: error.message || 'Authentication failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="w-full max-w-md">
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="text-center mb-8">
        <motion.div variants={scaleIn} className="inline-flex items-center justify-center h-16 w-16 rounded-2xl gradient-bg shadow-[var(--shadow-accent-lg)] mb-5">
          <Shield className="h-8 w-8 text-white" />
        </motion.div>
        <h1 className="text-[2.5rem] font-display text-foreground leading-tight">
          Waterpro
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Employee Management System
        </p>
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-card border border-border shadow-sm p-8"
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">
            Welcome back
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Enter your credentials to access your account</p>
        </div>

        {errors.submit && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={[
                'w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground',
                'placeholder:text-muted-foreground/50',
                'transition-all duration-200',
                'focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15',
                errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : 'border-border',
              ].filter(Boolean).join(' ')}
              placeholder="name@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={[
                  'w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground pr-10',
                  'placeholder:text-muted-foreground/50',
                  'transition-all duration-200',
                  'focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/15',
                  errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : 'border-border',
                ].filter(Boolean).join(' ')}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border text-[var(--color-accent)] focus:ring-[var(--color-accent)]/15"
              />
              <span className="text-sm text-muted-foreground">Remember me</span>
            </label>
            <button type="button" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group w-full inline-flex items-center justify-center font-semibold text-sm
              rounded-xl gradient-bg text-white shadow-[var(--shadow-accent)]
              hover:-translate-y-0.5 hover:shadow-[var(--shadow-accent-lg)] hover:brightness-110
              active:scale-[0.98]
              transition-all duration-200 focus:outline-none
              disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:-translate-y-0 disabled:scale-100
              px-5 py-3 gap-2 min-h-[48px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                Sign in
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            No account?{' '}
            <Link to="/register" className="font-medium text-[var(--color-accent)] hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.2 }}
        className="text-center mt-8"
      >
        <p className="text-xs text-muted-foreground">
          &copy; 2026 Waterpro HRIS. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
