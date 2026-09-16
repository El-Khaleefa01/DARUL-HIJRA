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
                <strong className="block text-3xl font-bold text-primary">{value}</strong>
                <span className="mt-1 block font-semibold">{label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{sub}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
