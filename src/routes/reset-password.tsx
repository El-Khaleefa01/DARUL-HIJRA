import { useEffect, useState, type FormEvent } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, MoonStar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — Darul Hijra" },
      { name: "description", content: "Set a new password for your Darul Hijra account." },
      { property: "og:title", content: "Reset Darul Hijra Password" },
      { property: "og:description", content: "Securely set a new portal password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    // Check hash for access_token or recovery type
    const hash = window.location.hash;
    const search = window.location.search;
    const isRecoveryHash = hash.includes("type=recovery") || hash.includes("access_token");
    const isRecoverySearch = search.includes("code=") || search.includes("type=recovery");

    if (isRecoveryHash || isRecoverySearch) {
      setValid(true);
    }

    // Also listen to Supabase auth state change for PASSWORD_RECOVERY event
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session != null) {
        setValid(true);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (password.length < 8) {
      const err = "Password must be at least 8 characters long.";
      setMessage(err);
      toast.error(err);
      return;
    }

    if (password !== confirmPassword) {
      const err = "Passwords do not match. Please re-enter.";
      setMessage(err);
      toast.error(err);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMessage(error.message);
        toast.error(error.message);
        setLoading(false);
        return;
      }

      setComplete(true);
      toast.success("Password updated successfully!");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Password update failed.";
      setMessage(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="islamic-pattern grid min-h-screen place-items-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/auth"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to portal login
        </Link>
        <section className="rounded-xl border bg-card p-8 shadow-xl">
          <div className="text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <KeyRound className="size-6 text-accent" />
            </span>
            <p className="mt-3 font-arabic text-xl font-bold text-primary" dir="rtl">
              دار الهجرة
            </p>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">Set New Password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose a strong, secure password for your portal account.
            </p>
          </div>

          {complete ? (
            <div className="mt-8 text-center">
              <CheckCircle2 className="mx-auto size-14 text-primary" />
              <h2 className="mt-4 text-2xl font-bold text-foreground">Password Reset!</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your portal password has been updated. You can now log in with your new credentials.
              </p>
              <Button
                onClick={() => navigate({ to: "/auth" })}
                className="mt-6 w-full h-12 font-semibold"
              >
                Proceed to Login
              </Button>
            </div>
          ) : valid ? (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="h-12 bg-card pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  Confirm New Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="h-12 bg-card"
                  required
                />
              </div>

              {message && (
                <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {message}
                </p>
              )}

              <Button type="submit" className="h-12 w-full font-semibold" disabled={loading}>
                {loading && <Loader2 className="mr-2 size-5 animate-spin" />}
                Update Portal Password
              </Button>
            </form>
          ) : (
            <div className="mt-6 rounded-lg bg-secondary p-4 text-center">
              <p className="text-sm text-secondary-foreground leading-relaxed">
                Password recovery verification token not detected.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Please make sure you opened the complete reset link sent to your email, or request a
                new reset link from the login page.
              </p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link to="/auth">Back to Login</Link>
              </Button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
