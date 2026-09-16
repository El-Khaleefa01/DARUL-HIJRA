import { useState, type FormEvent, type ReactNode } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { z } from "zod";
import daruLogo from "@/assets/Daru-Logo.png";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(6, "Password must contain at least 6 characters").max(72),
});

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in — Darul Hijra" },
      { name: "description", content: "Log in to the Darul Hijra college portal." },
      { property: "og:title", content: "Darul Hijra Portal Login" },
      {
        property: "og:description",
        content: "Secure access for Darul Hijra students, teachers and administrators.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState("");

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const err = parsed.error.issues[0]?.message ?? "Please check your credentials.";
      setMessage(err);
      toast.error(err);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (error) {
        localStorage.removeItem("darul_hijra_demo_user");
        const errMsg =
          error.message === "Invalid login credentials"
            ? "Incorrect email or password. You can also use the Demo Access below."
            : error.message;
        setMessage(errMsg);
        toast.error(errMsg);
        setLoading(false);
        return;
      }

      if (data.user) {
        toast.success("Welcome back to Darul Hijra Portal!");
        navigate({ to: "/dashboard" });
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Authentication error occurred.";
      setMessage(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setLoading(true);
    setMessage("");
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/dashboard`,
      });

      if (result.error) {
        throw result.error;
      }
      if (!result.redirected) {
        navigate({ to: "/dashboard" });
      }
    } catch {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) {
          setMessage("Google sign-in could not be completed: " + error.message);
          toast.error("Google sign-in failed.");
        }
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : "OAuth provider error.";
        setMessage(errMsg);
        toast.error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    const trimmed = email.trim();
    if (!z.string().email().safeParse(trimmed).success) {
      setMessage("Please type your email address above first.");
      toast.warning("Enter your email address in the field first.");
      return;
    }

    setResetting(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setMessage("Could not send password reset email: " + error.message);
        toast.error(error.message);
      } else {
        const msg = "Password reset instructions sent! Please check your email inbox.";
        setMessage(msg);
        toast.success(msg);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Reset request failed.";
      setMessage(msg);
    } finally {
      setResetting(false);
    }
  }

  function enterDemoMode(role: "admin" | "teacher" | "student") {
    const demoProfiles = {
      admin: {
        id: "demo-admin-id",
        email: "admin@darulhijra.edu",
        role: "admin",
        user_metadata: { full_name: "Ustadh Ibrahim (Principal Admin)" },
      },
      teacher: {
        id: "demo-teacher-id",
        email: "teacher@darulhijra.edu",
        role: "teacher",
        user_metadata: { full_name: "Ustadh Musa Kareem (Academic Staff)" },
      },
      student: {
        id: "demo-student-id",
        email: "student@darulhijra.edu",
        role: "student",
        user_metadata: { full_name: "Amina Yusuf (Student)" },
      },
    };

    localStorage.setItem("darul_hijra_demo_user", JSON.stringify(demoProfiles[role]));
    toast.success(`Logged in as ${role.toUpperCase()} (Demo Mode)`);
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Darul Hijra academic & management portal."
    >
      <form onSubmit={signIn} className="space-y-5">
        <div>
          <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-foreground">
            Email address
          </label>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. scholar@darulhijra.edu"
            className="h-12 bg-card"
            required
          />
        </div>

        <div>
          <div className="mb-2 flex justify-between items-center">
            <label htmlFor="login-password" className="text-sm font-semibold text-foreground">
              Password
            </label>
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={resetting}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {resetting ? "Sending link..." : "Forgot password?"}
            </button>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-12 bg-card pr-11"
              required
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
        </div>

        {message && (
          <p
            role="status"
            className="rounded-md border border-primary/20 bg-secondary p-3 text-sm text-secondary-foreground"
          >
            {message}
          </p>
        )}

        <Button type="submit" className="h-12 w-full font-semibold text-base" disabled={loading}>
          {loading && <Loader2 className="mr-2 size-5 animate-spin" />}
          Sign In to Portal
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground uppercase font-semibold">
        <span className="h-px flex-1 bg-border" />
        OR
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-12 w-full font-medium"
        onClick={signInWithGoogle}
        disabled={loading}
      >
        Continue with Google
      </Button>

      <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
          <Sparkles className="size-4" /> Instant Demo / Preview Access
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Explore the full portal features instantly without registering:
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => enterDemoMode("admin")}
            className="text-xs h-9 font-semibold"
          >
            <ShieldCheck className="size-3 mr-1" /> Admin
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => enterDemoMode("teacher")}
            className="text-xs h-9 font-semibold"
          >
            Teacher
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => enterDemoMode("student")}
            className="text-xs h-9 font-semibold"
          >
            Student
          </Button>
        </div>
      </div>

      <p className="mt-7 text-center text-sm text-muted-foreground">
        New student or applicant?{" "}
        <Link to="/register" className="font-bold text-primary hover:underline">
          Create student account
        </Link>
      </p>
    </AuthShell>
  );
}

function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="islamic-pattern grid min-h-screen place-items-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to school website
        </Link>
        <section className="rounded-xl border bg-card p-7 shadow-xl sm:p-9">
          <div className="mb-7 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <img src={daruLogo} alt="Darul Hijra logo" className="size-full object-contain" />
            </span>
            <p className="mt-3 font-arabic text-xl font-bold text-primary" dir="rtl">
              دار الهجرة
            </p>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
