import { useState, type FormEvent } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { z } from "zod";
import daruLogo from "@/assets/Daru-Logo.png";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const registerSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(30),
  programme: z.string().min(1, "Select an academic programme"),
  previous_school: z.string().trim().max(150).optional(),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Student Registration — Darul Hijra" },
      {
        name: "description",
        content: "Create your Darul Hijra student account and begin your admission.",
      },
      { property: "og:title", content: "Register at Darul Hijra" },
      {
        property: "og:description",
        content: "Create an account for Darul Hijra Arabic and Islamic College.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);
  const [hasImmediateSession, setHasImmediateSession] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const formValues = Object.fromEntries(formData);
    const parsed = registerSchema.safeParse(formValues);

    if (!parsed.success) {
      const err = parsed.error.issues[0]?.message ?? "Please check the entered information.";
      setMessage(err);
      toast.error(err);
      return;
    }

    setLoading(true);
    const { full_name, email, password, phone, programme, previous_school } = parsed.data;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name,
            phone,
            programme,
          },
        },
      });

      if (error) {
        setMessage(error.message);
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        try {
          await supabase.from("admissions").insert([
            {
              applicant_id: data.user.id,
              full_name,
              email,
              phone,
              programme,
              previous_school: previous_school || null,
              status: "pending",
            },
          ]);
        } catch {
          // Non-critical, continue
        }
      }

      setLoading(false);
      toast.success("Account registration submitted successfully!");

      if (data.session) {
        setHasImmediateSession(true);
      }
      setComplete(true);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Registration error occurred.";
      setMessage(errMsg);
      toast.error(errMsg);
      setLoading(false);
    }
  }

  return (
    <main className="islamic-pattern grid min-h-screen place-items-center px-5 py-12">
      <div className="w-full max-w-xl">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to school website
        </Link>
        <section className="rounded-xl border bg-card p-7 shadow-xl sm:p-10">
          <div className="text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <img src={daruLogo} alt="Darul Hijra logo" className="size-full object-contain" />
            </span>
            <p className="mt-3 font-arabic text-xl font-bold text-primary" dir="rtl">
              دار الهجرة
            </p>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">Student Registration</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Create an account to begin your admission process and access portal records.
            </p>
          </div>

          {complete ? (
            <div className="mt-8 text-center">
              <CheckCircle2 className="mx-auto size-14 text-primary" />
              <h2 className="mt-4 text-2xl font-bold text-foreground">Registration Complete!</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {hasImmediateSession
                  ? "Your account is active and verified. You can now access your Darul Hijra portal directly."
                  : "We sent a confirmation link to your email. Please check your inbox (and spam folder) to activate your account, then sign in."}
              </p>
              <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                {hasImmediateSession ? (
                  <Button
                    onClick={() => navigate({ to: "/dashboard" })}
                    className="bg-primary text-primary-foreground h-11 px-6 font-semibold"
                  >
                    Enter Student Portal <ArrowRight className="ml-2 size-4" />
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="bg-primary text-primary-foreground h-11 px-6 font-semibold"
                  >
                    <Link to="/auth">Go to Portal Login</Link>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 grid gap-5 sm:grid-cols-2">
              <Field
                label="Full Name (Legal)"
                name="full_name"
                autoComplete="name"
                placeholder="e.g. Amina Yusuf"
                required
              />
              <Field
                label="Phone Number"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+234 800 000 0000"
                required
              />

              <div className="sm:col-span-2">
                <Field
                  label="Email Address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="programme"
                  className="mb-2 block text-sm font-semibold text-foreground"
                >
                  Desired Academic Programme
                </label>
                <select
                  id="programme"
                  name="programme"
                  required
                  defaultValue="Qur’an & Tajweed"
                  className="flex h-12 w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="Qur’an & Tajweed">Qur’an & Tajweed (Tahfiz)</option>
                  <option value="Arabic Language">Arabic Language & Literature</option>
                  <option value="Islamic Studies">Islamic Studies (Fiqh, Hadith, 'Aqeedah)</option>
                  <option value="Combined Arabic & Secondary">
                    Combined Arabic & Secondary Academic
                  </option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <Field
                  label="Previous School / Madrasah (Optional)"
                  name="previous_school"
                  placeholder="e.g. Al-Manar Islamic Academy"
                />
              </div>

              <div className="sm:col-span-2">
                <Field
                  label="Portal Password (at least 8 characters)"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  required
                />
              </div>

              {message && (
                <p
                  role="alert"
                  className="rounded-md border border-primary/20 bg-secondary p-3 text-sm text-secondary-foreground sm:col-span-2"
                >
                  {message}
                </p>
              )}

              <Button
                type="submit"
                className="h-12 sm:col-span-2 font-semibold text-base"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 size-5 animate-spin" />}
                Create Student Account
              </Button>
            </form>
          )}

          <p className="mt-7 text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link to="/auth" className="font-bold text-primary hover:underline">
              Log in to Portal
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-semibold text-foreground">
        {label}
      </label>
      <Input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        className="h-12 bg-card"
      />
    </div>
  );
}
