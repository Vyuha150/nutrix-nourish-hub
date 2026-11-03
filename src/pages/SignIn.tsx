import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/nutrix/Logo";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setSubmitting(true);
      const user = await signIn(trimmedEmail, password);
      toast.success(`Welcome back, ${user.name}!`);

      // Role-based redirection:
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate(from && from !== "/signin" && !from.startsWith("/admin") ? from : "/", {
          replace: true,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid credentials";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      {/* Top bar with back link */}
      <header className="border-b border-border/60 py-4 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-leaf transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Back to Nutrix</span>
          </Link>
          <Link to="/" className="flex items-center">
            <Logo size={32} variant="leaf" />
          </Link>
        </div>
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6 animate-fade-up">
          <div className="text-center space-y-2">
            <div className="label-eyebrow text-leaf mb-2">Account access</div>
            <h1 className="font-serif text-3xl md:text-4xl text-primary font-semibold tracking-tight">
              Sign in to Nutrix
            </h1>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Access your personalized nutrition stacks, lab reports, and order history.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-soft">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive font-medium leading-relaxed">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                    className="pl-10 h-11 bg-background"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting}
                    className="pl-10 h-11 bg-background"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-full bg-primary hover:bg-forest text-primary-foreground font-medium shadow-soft gap-2 mt-2"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  <>
                    Sign In <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-border/60 text-center">
              <p className="text-xs text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="text-leaf font-semibold hover:underline">
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground border-t border-border/40">
        Nutrix Nourish Hub · Clinically dosed daily nutrition
      </footer>
    </div>
  );
};

export default SignIn;
