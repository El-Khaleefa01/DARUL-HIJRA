import { useState, useEffect } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Menu,
  Users,
  X,
  Sparkles,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import campusImage from "@/assets/darul-hijra-campus.jpg";
import daruLogo from "@/assets/Daru-Logo.png";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Darul Hijra School Arabic & Islamic College" },
      {
        name: "description",
        content:
          "A modern Islamic college nurturing faith, knowledge and excellent character through Arabic, Qur'an and Islamic sciences.",
      },
      { property: "og:title", content: "Darul Hijra School Arabic & Islamic College" },
      {
        property: "og:description",
        content: "A modern Islamic college nurturing faith, knowledge and excellent character.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type NewsItem = {
  id: string;
  category: string;
  title: string;
  date: string;
};

type EventItem = {
  id: string;
  title: string;
  date: string;
  venue: string;
};

const defaultNews: NewsItem[] = [
  {
    id: "1",
    category: "Admissions",
    title: "New student assessment week and screening begins",
    date: "22 September 2026",
  },
  {
    id: "2",
    category: "Academics",
    title: "New classical and modern Arabic texts arrive at college library",
    date: "28 September 2026",
  },
  {
    id: "3",
    category: "Community",
    title: "Annual Qur’an recitation gathering and prizes ceremony",
    date: "4 October 2026",
  },
];

const defaultEvents: EventItem[] = [
  {
    id: "e1",
    title: "Qur’an Recitation & Tajweed Exhibition",
    date: "4 October 2026, 09:00 AM",
    venue: "Main Campus Auditorium",
  },
  {
    id: "e2",
    title: "First-Term Parents & Teachers Orientation",
    date: "12 October 2026, 10:30 AM",
    venue: "College Conference Hall",
  },
  {
    id: "e3",
    title: "Hadith Studies Colloquium for Advanced Learners",
    date: "25 October 2026, 02:00 PM",
    venue: "Imam Bukhari Lecture Hall",
  },
];

function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [news, setNews] = useState<NewsItem[]>(defaultNews);
  const [events, setEvents] = useState<EventItem[]>(defaultEvents);

  useEffect(() => {
    async function loadNewsAndEvents() {
      try {
        const { data: newsData } = await supabase
          .from("news")
          .select("id, title, excerpt, published_at")
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .limit(3);

        if (newsData && newsData.length > 0) {
          setNews(
            newsData.map((item) => ({
              id: item.id,
              category: "College News",
              title: item.title,
              date: new Date(item.published_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            })),
          );
        }

        const { data: eventsData } = await supabase
          .from("events")
          .select("id, title, starts_at, venue")
          .eq("is_published", true)
          .order("starts_at", { ascending: true })
          .limit(3);

        if (eventsData && eventsData.length > 0) {
          setEvents(
            eventsData.map((item) => ({
              id: item.id,
              title: item.title,
              date: new Date(item.starts_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
              venue: item.venue || "College Campus",
            })),
          );
        }
      } catch {
        // Fall back gracefully to default curated items if database is unreachable
      }
    }

    loadNewsAndEvents();
  }, []);

  const programmes = [
    {
      icon: BookOpen,
      title: "Qur’an & Tafseer",
      arabic: "القرآن والتفسير",
      text: "Comprehensive recitation, memorisation (Tahfiz) and rules of accurate, melodious articulation.",
      highlights: ["Hafs 'an 'Asim tajweed", "Systematic Hifdh track", "Certified Asanid masters"],
    },
    {
      icon: GraduationCap,
      title: "Arabic Language",
      arabic: "اللغة العربية",
      text: "Grammar (Nahw), morphology (Sarf), conversation and rhetoric taught through immersive direct methods.",
      highlights: ["Interactive conversation", "Classical literature", "Fluency & composition"],
    },
    {
      icon: Users,
      title: "Islamic Studies",
      arabic: "الدراسات الإسلامية",
      text: "Fiqh, Hadith terminology, Seerah, Creed ('Aqeedah) and practical character development for daily life.",
      highlights: [
        "Solid foundational Fiqh",
        "Prophetic character ethics",
        "Contemporary relevance",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Announcements Bar */}
      <div className="bg-primary/95 text-primary-foreground border-b border-primary/20 text-xs py-2 px-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 font-semibold text-accent">
              <Sparkles className="size-3" /> Admissions 2026/2027 Open
            </span>
            <span className="hidden md:inline text-primary-foreground/80">
              Applications for new term Arabic & Tahfiz programmes are now accepted.
            </span>
          </div>
          <div className="flex items-center gap-4 text-primary-foreground/90">
            <a
              href="tel:+2348000000000"
              className="hidden sm:inline-flex items-center gap-1 hover:text-accent transition-colors"
            >
              <Phone className="size-3" /> Admissions Desk
            </a>
            <Link to="/auth" className="font-medium underline hover:text-accent transition-colors">
              Portal Login →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Navigation */}
      <header className="sticky top-0 z-30 border-b border-primary/15 bg-primary/90 text-primary-foreground backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link to="/" className="flex items-center gap-3 text-primary-foreground group">
            <span className="grid size-11 place-items-center rounded-lg border border-primary-foreground/30 bg-primary shadow-inner transition-transform group-hover:scale-105">
              <img src={daruLogo} alt="Darul Hijra logo" className="size-full object-contain" />
            </span>
            <span>
              <strong className="block font-display text-lg tracking-tight">DARUL HIJRA</strong>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                Arabic & Islamic College
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 text-sm font-semibold text-primary-foreground/90 lg:flex">
            <a href="#school" className="transition-colors hover:text-accent">
              School
            </a>
            <a href="#programmes" className="transition-colors hover:text-accent">
              Programmes
            </a>
            <a href="#admissions" className="transition-colors hover:text-accent">
              Admissions
            </a>
            <a href="#news" className="transition-colors hover:text-accent">
              News & Events
            </a>
            <a href="#contact" className="transition-colors hover:text-accent">
              Contact
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 lg:flex">
            <Button
              asChild
              variant="ghost"
              className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            >
              <Link to="/auth">Portal Login</Link>
            </Button>
            <Button
              asChild
              className="bg-accent text-accent-foreground font-semibold hover:bg-accent/90 shadow-sm"
            >
              <Link to="/register">Register Student</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              asChild
              size="sm"
              className="bg-accent text-accent-foreground font-semibold hover:bg-accent/90"
            >
              <Link to="/auth">Login</Link>
            </Button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-md p-2 text-primary-foreground hover:bg-primary-foreground/10 focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-primary-foreground/15 bg-primary px-5 py-6 text-primary-foreground lg:hidden">
            <nav className="flex flex-col space-y-4 text-base font-semibold">
              <a
                href="#school"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 hover:bg-primary-foreground/10 hover:text-accent transition-colors"
              >
                School Overview
              </a>
              <a
                href="#programmes"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 hover:bg-primary-foreground/10 hover:text-accent transition-colors"
              >
                Academic Programmes
              </a>
              <a
                href="#admissions"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 hover:bg-primary-foreground/10 hover:text-accent transition-colors"
              >
                Admissions & Enrollment
              </a>
              <a
                href="#news"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 hover:bg-primary-foreground/10 hover:text-accent transition-colors"
              >
                News & Events
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 hover:bg-primary-foreground/10 hover:text-accent transition-colors"
              >
                Contact & Location
              </a>

              <div className="pt-4 border-t border-primary-foreground/15 flex flex-col gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-primary-foreground/30 text-primary-foreground bg-primary/20 hover:bg-primary-foreground/20"
                >
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    Sign In to Portal
                  </Link>
                </Button>
                <Button
                  asChild
                  className="w-full bg-accent text-accent-foreground font-semibold hover:bg-accent/90"
                >
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    Create Student Account
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative flex min-h-[720px] items-end overflow-hidden bg-primary">
          <img
            src={campusImage}
            alt="Darul Hijra students and campus courtyard"
            width={1600}
            height={1008}
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/55 to-primary/30" />
          <div className="relative mx-auto w-full max-w-7xl px-5 pb-20 pt-36 text-primary-foreground lg:px-8 lg:pb-24">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-primary/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-accent backdrop-blur-sm mb-6">
              <Sparkles className="size-3.5" /> Faith · Knowledge · Character
            </div>
            <h1 className="max-w-4xl text-4xl font-bold leading-[1.1] md:text-6xl lg:text-7xl">
              Learning rooted in authentic faith, built for the modern future.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-primary-foreground/90 md:text-xl">
              Darul Hijra provides a rigorous, balanced curriculum blending classical Arabic
              fluency, complete Qur&apos;anic sciences, authentic Hadith and Islamic ethics with
              modern scholarship.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="bg-accent text-accent-foreground font-semibold hover:bg-accent/90 shadow-lg text-base h-12 px-6"
              >
                <Link to="/register">
                  Begin Admission <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/60 bg-primary/40 text-primary-foreground backdrop-blur-sm hover:bg-primary-foreground/15 hover:text-primary-foreground text-base h-12 px-6"
              >
                <a href="#programmes">Explore Programmes</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Statistics Banner */}
        <section id="school" className="border-b bg-card">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y px-5 md:grid-cols-4 md:divide-y-0 lg:px-8">
            {[
              ["500+", "Active Learners", "Across primary and secondary tiers"],
              ["20+", "Certified Teachers", "Trained scholars & educators"],
              ["10", "Equipped Classes", "Small learner-to-teacher ratio"],
              ["100%", "Accredited Curriculum", "Traditional and modern synthesis"],
            ].map(([value, label, sub]) => (
              <div key={label} className="px-4 py-8 text-center sm:px-6">
                <strong className="block font-display text-3xl font-bold text-primary sm:text-4xl">
                  {value}
                </strong>
                <span className="mt-1 block text-sm font-bold uppercase tracking-wider text-foreground">
                  {label}
                </span>
                <small className="mt-1 block text-xs text-muted-foreground">{sub}</small>
              </div>
            ))}
          </div>
        </section>

        {/* Programmes Section */}
        <section id="programmes" className="islamic-pattern py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
                Our Educational Tradition
              </p>
              <h2 className="mt-3 text-3xl font-bold md:text-5xl">
                Knowledge that shapes the whole individual
              </h2>
              <p className="mt-4 text-base text-muted-foreground md:text-lg">
                Structured pedagogical pathways designed to nurture confident scholars, articulate
                speakers, and upright community leaders grounded in Prophetic values.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {programmes.map(({ icon: Icon, title, arabic, text, highlights }) => (
                <article
                  key={title}
                  className="flex flex-col justify-between rounded-xl border bg-card p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="grid size-12 place-items-center rounded-lg bg-secondary text-primary">
                        <Icon className="size-6" />
                      </span>
                      <p className="font-arabic text-2xl font-bold text-primary" dir="rtl">
                        {arabic}
                      </p>
                    </div>
                    <h3 className="mt-6 text-2xl font-bold text-foreground">{title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
                      Key Pillars:
                    </p>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      {highlights.map((h) => (
                        <li key={h} className="flex items-center gap-2">
                          <span className="size-1.5 rounded-full bg-accent" /> {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Admissions CTA Section */}
        <section
          id="admissions"
          className="bg-primary py-20 text-primary-foreground relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10 pointer-events-none">
            <Sparkles className="size-96 text-primary-foreground" />
          </div>
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 md:flex-row md:items-center lg:px-8 relative z-10">
            <div className="max-w-2xl">
              <span className="inline-block rounded-full bg-accent/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-accent mb-3">
                Admissions Portal
              </span>
              <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl">
                Ready to begin your journey at Darul Hijra?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-primary-foreground/85 md:text-lg">
                Create your student portal account, submit your admission details online, and follow
                your screening, class placement, and academic records in real-time.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button
                asChild
                size="lg"
                className="bg-accent text-accent-foreground font-semibold hover:bg-accent/90 shadow-md h-12 px-6"
              >
                <Link to="/register">
                  Apply for Admission <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 bg-primary/20 text-primary-foreground hover:bg-primary-foreground/15 h-12 px-6"
              >
                <Link to="/auth">Already Enrolled? Login</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* News & Events Section */}
        <section id="news" className="py-24 bg-background">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
                  College Life & Campus Notices
                </p>
                <h2 className="mt-2 text-3xl font-bold md:text-4xl">News & Academic Events</h2>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <CalendarDays className="size-5" /> Active Academic Term 2026/2027
              </div>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {news.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col justify-between rounded-lg border border-t-4 border-t-primary bg-card p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div>
                    <span className="inline-block rounded bg-secondary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                      {item.category}
                    </span>
                    <h3 className="mt-4 text-xl font-bold leading-snug text-foreground">
                      {item.title}
                    </h3>
                  </div>
                  <p className="mt-6 text-xs font-semibold text-muted-foreground">{item.date}</p>
                </article>
              ))}
            </div>

            <div className="mt-14 rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between border-b pb-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground">Upcoming Campus Schedule</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Key college dates, examinations, and community gatherings
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/auth">View In Portal →</Link>
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {events.map((ev) => (
                  <div key={ev.id} className="rounded-lg bg-secondary/70 p-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-primary">
                      <CalendarDays className="size-4" />
                      <span>{ev.date}</span>
                    </div>
                    <strong className="mt-2 block text-base font-semibold text-foreground">
                      {ev.title}
                    </strong>
                    <span className="mt-2 block text-xs text-muted-foreground">
                      <MapPin className="inline size-3 mr-1" />
                      {ev.venue}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact and Location Section */}
        <section id="contact" className="border-t bg-muted/40 py-16">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <strong className="block font-display text-xl text-primary">
                  Darul Hijra Arabic & Islamic College
                </strong>
                <p className="mt-2 text-sm text-muted-foreground">
                  Center for excellence in classical Arabic, Qur&apos;anic studies, and holistic
                  Islamic education.
                </p>
              </div>
              <div>
                <strong className="block text-sm font-bold uppercase tracking-wider text-foreground">
                  School Address
                </strong>
                <p className="mt-2 text-sm text-muted-foreground flex items-start gap-2">
                  <MapPin className="size-4 shrink-0 mt-0.5 text-primary" />
                  <span>No 36, Wheather Head, Sabon Gari, Kano State</span>
                </p>
              </div>
              <div>
                <strong className="block text-sm font-bold uppercase tracking-wider text-foreground">
                  Admissions Enquiries
                </strong>
                <p className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="size-4 text-primary" />
                  <span>admissions@darulhijra.edu</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
                  <Phone className="size-4 text-primary" />
                  <span>+234 (0) 800-DARUL-HIJRA</span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground md:flex-row lg:px-8">
          <span>
            © {new Date().getFullYear()} Darul Hijra Arabic & Islamic College. All rights reserved.
          </span>
          <span className="font-arabic text-xl font-bold text-primary" dir="rtl">
            دار الهجرة للدراسات العربية والإسلامية
          </span>
        </div>
      </footer>
    </div>
  );
}
