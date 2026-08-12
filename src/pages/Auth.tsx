import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { PasswordStrengthMeter } from '@/components/PasswordStrengthMeter';
import { ArrowRight, Lock, ShieldCheck } from 'lucide-react';
import { SEO } from '@/components/SEO';

export default function Auth() {
  const navigate = useNavigate();
  const { setMasterPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupDisplayName, setSignupDisplayName] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      if (data.session) {
        // Record successful login
        await supabase.from('login_history').insert({
          user_id: data.user.id,
          user_agent: navigator.userAgent,
          status: 'success',
        });
        
        setMasterPassword(loginPassword);
        toast.success('Welcome back.');
        navigate('/vault');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupPassword !== signupConfirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (signupPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            display_name: signupDisplayName,
          },
          emailRedirectTo: `${window.location.origin}/vault`,
        },
      });

      if (error) throw error;

      if (data.session) {
        setMasterPassword(signupPassword);
        toast.success('Account created.');
        navigate('/vault');
      } else {
        toast.success('Please check your email to verify your account.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <SEO 
        title={isLogin ? 'Sign In' : 'Create Free Vault'} 
        description="Sign in to your SecureVault or create a free zero-knowledge encrypted digital vault to secure your passwords."
        url="/auth"
      />
      {/* Left Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 relative z-10 bg-background border-r border-border">
        <div className="max-w-[380px] w-full mx-auto space-y-10 py-12">
          {/* Minimalist Logo - Perfectly aligned with content */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center">
              <Lock className="h-4 w-4" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">SecureVault.</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {isLogin ? 'Sign in to your vault' : 'Create an account'}
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              {isLogin 
                ? 'Enter your details below to proceed.' 
                : 'Set up your master key to begin.'}
            </p>
          </div>

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-xs font-semibold text-foreground">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="h-11 rounded-md border-border bg-background focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-xs font-semibold text-foreground">Master Password</Label>
                  <a href="#" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Forgot?</a>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="h-11 rounded-md border-border bg-background focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
                />
              </div>

              <Button type="submit" className="w-full h-11 rounded-md shadow-sm font-medium transition-transform active:scale-[0.98]" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-xs font-semibold text-foreground">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={signupDisplayName}
                  onChange={(e) => setSignupDisplayName(e.target.value)}
                  className="h-11 rounded-md border-border bg-background focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-xs font-semibold text-foreground">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="name@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  className="h-11 rounded-md border-border bg-background focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-xs font-semibold text-foreground">Master Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a strong password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  className="h-11 rounded-md border-border bg-background focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
                />
                <div className="pt-1">
                  <PasswordStrengthMeter password={signupPassword} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm" className="text-xs font-semibold text-foreground">Confirm Password</Label>
                <Input
                  id="signup-confirm"
                  type="password"
                  placeholder="Confirm your password"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  required
                  className="h-11 rounded-md border-border bg-background focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
                />
              </div>

              <div className="p-4 bg-secondary rounded-md border border-border">
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  <span className="text-foreground block mb-1">Zero-Knowledge Architecture</span> 
                  We cannot recover your master password if you lose it. Store it safely.
                </p>
              </div>

              <Button type="submit" className="w-full h-11 rounded-md shadow-sm font-medium transition-transform active:scale-[0.98]" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}

          <div className="text-sm text-muted-foreground pt-4 border-t border-border">
            {isLogin ? (
              <p>
                New to SecureVault?{' '}
                <button onClick={() => setIsLogin(false)} className="text-foreground font-medium hover:underline">
                  Create an account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button onClick={() => setIsLogin(true)} className="text-foreground font-medium hover:underline">
                  Sign in instead
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right Feature Section - Pure Fintech Minimalism */}
      <div className="hidden lg:flex w-1/2 bg-zinc-950 flex-col relative overflow-hidden">
        {/* Subtle, highly structured grid line */}
        <div className="absolute top-0 left-12 w-px h-full bg-white/5"></div>
        <div className="absolute top-0 left-24 w-px h-full bg-white/5"></div>
        <div className="absolute top-32 left-0 w-full h-px bg-white/5"></div>
        
        <div className="relative z-10 flex-1 flex flex-col justify-center px-24">
          <div className="max-w-md">
            <h2 className="text-4xl font-semibold text-white tracking-tight leading-[1.1] mb-8">
              Uncompromising security.
            </h2>
            
            <div className="space-y-8">
              <div className="border-l border-white/20 pl-6 relative">
                <div className="absolute left-[-17px] top-0 h-8 w-8 bg-zinc-950 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-zinc-400" />
                </div>
                <h3 className="text-base font-semibold text-white">End-to-End Encryption</h3>
                <p className="text-zinc-400 text-sm mt-2 leading-relaxed font-medium">
                  Data is encrypted locally using AES-256-GCM. We never see your plaintext data.
                </p>
              </div>

              <div className="border-l border-white/20 pl-6 relative">
                <div className="absolute left-[-17px] top-0 h-8 w-8 bg-zinc-950 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-zinc-400" />
                </div>
                <h3 className="text-base font-semibold text-white">Zero-Knowledge</h3>
                <p className="text-zinc-400 text-sm mt-2 leading-relaxed font-medium">
                  Authentication is handled via SRP. Your master password never leaves your device.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-12 text-xs text-zinc-600 font-medium flex justify-between">
          <p>© SecureVault</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </div>
  );
}