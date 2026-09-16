import { useState, useEffect, useMemo, type FormEvent } from "react";
import { Link, createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  CalendarDays,
  Check,
  ClipboardCheck,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Plus,
  School,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
  Sparkles,
  ChevronRight,
  Shield,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "School Portal — Darul Hijra" },
      {
        name: "description",
        content: "Manage Darul Hijra students, classes, results, admissions and fees.",
      },
      { property: "og:title", content: "Darul Hijra School Portal" },
      { property: "og:description", content: "Secure school management portal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

type ModuleName =
  | "Overview"
  | "Students"
  | "Teachers"
  | "Classes"
  | "Subjects"
  | "Results"
  | "Admissions"
  | "Fees"
  | "News"
  | "Events";

const modules: { name: ModuleName; icon: React.ComponentType<{ className?: string }> }[] = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Students", icon: GraduationCap },
  { name: "Teachers", icon: Users },
  { name: "Classes", icon: School },
  { name: "Subjects", icon: BookOpen },
  { name: "Results", icon: ClipboardCheck },
  { name: "Admissions", icon: UserPlus },
  { name: "Fees", icon: CreditCard },
  { name: "News", icon: Newspaper },
  { name: "Events", icon: CalendarDays },
];

export type TableRow = {
  id: string;
  col1: string; // Reference / ID
  col2: string; // Name / Main Title
  col3: string; // Details / Subtitle
  col4: string; // Status / Tag
  extra?: Record<string, string>;
};

const initialModuleData: Record<Exclude<ModuleName, "Overview">, TableRow[]> = {
  Students: [
    { id: "1", col1: "DH-26014", col2: "Amina Yusuf", col3: "Arabic Level 2", col4: "Active" },
    { id: "2", col1: "DH-26015", col2: "Abdullah Musa", col3: "Tahfiz 1 (Hifdh)", col4: "Active" },
    { id: "3", col1: "DH-26016", col2: "Maryam Bello", col3: "Islamic Studies 3", col4: "Active" },
    { id: "4", col1: "DH-26017", col2: "Zayd Abubakar", col3: "Arabic Level 1", col4: "Active" },
    { id: "5", col1: "DH-26018", col2: "Fatima Umar", col3: "Tahfiz 2 (Hifdh)", col4: "Suspended" },
  ],
  Teachers: [
    {
      id: "1",
      col1: "TH-021",
      col2: "Ustadh Ibrahim Lawal",
      col3: "Hadith & Fiqh",
      col4: "Full-time",
    },
    {
      id: "2",
      col1: "TH-024",
      col2: "Ustadha Fatimah Ali",
      col3: "Tajweed & Qira'at",
      col4: "Full-time",
    },
    {
      id: "3",
      col1: "TH-031",
      col2: "Ustadh Musa Kareem",
      col3: "Arabic Grammar (Nahw)",
      col4: "Visiting",
    },
    {
      id: "4",
      col1: "TH-035",
      col2: "Ustadh Bilal Sani",
      col3: "Islamic History & Seerah",
      col4: "Full-time",
    },
  ],
  Classes: [
    {
      id: "1",
      col1: "AR-201",
      col2: "Arabic Level 2",
      col3: "Room 06 (Mon-Thu 8:00)",
      col4: "32 learners",
    },
    {
      id: "2",
      col1: "TH-101",
      col2: "Tahfiz 1",
      col3: "Qur’an Hall (Daily 6:30)",
      col4: "24 learners",
    },
    {
      id: "3",
      col1: "IS-301",
      col2: "Islamic Studies 3",
      col3: "Room 11 (Mon-Wed 10:00)",
      col4: "28 learners",
    },
    {
      id: "4",
      col1: "AR-101",
      col2: "Arabic Level 1 (Foundations)",
      col3: "Room 04 (Mon-Fri 8:00)",
      col4: "35 learners",
    },
  ],
  Subjects: [
    {
      id: "1",
      col1: "QUR101",
      col2: "Qur’an & Tajweed",
      col3: "القرآن والتجويد — Core rules of recitation",
      col4: "Core",
    },
    {
      id: "2",
      col1: "ARB201",
      col2: "Arabic Grammar",
      col3: "النحو العربي — Rules of sentence structure",
      col4: "Core",
    },
    {
      id: "3",
      col1: "FIQ301",
      col2: "Fiqh (Islamic Jurisprudence)",
      col3: "الفقه الإسلامي — Acts of worship and daily life",
      col4: "Core",
    },
    {
      id: "4",
      col1: "HAD102",
      col2: "Hadith Terminology",
      col3: "مصطلح الحديث — Prophetic traditions & chains",
      col4: "Elective",
    },
  ],
  Results: [
    {
      id: "1",
      col1: "Amina Yusuf",
      col2: "Arabic Grammar",
      col3: "First Term 2026",
      col4: "92% (Excellent)",
    },
    {
      id: "2",
      col1: "Abdullah Musa",
      col2: "Tajweed Assessment",
      col3: "First Term 2026",
      col4: "88% (Very Good)",
    },
    {
      id: "3",
      col1: "Maryam Bello",
      col2: "Fiqh Studies",
      col3: "First Term 2026",
      col4: "95% (Distinction)",
    },
    {
      id: "4",
      col1: "Zayd Abubakar",
      col2: "Arabic Level 1",
      col3: "First Term 2026",
      col4: "79% (Good)",
    },
  ],
  Admissions: [
    {
      id: "1",
      col1: "ADM-1802",
      col2: "Zainab Ibrahim",
      col3: "Arabic Programme (zainab@example.com)",
      col4: "Reviewing",
    },
    {
      id: "2",
      col1: "ADM-1803",
      col2: "Yusuf Abdullahi",
      col3: "Tahfiz Programme (yusuf@example.com)",
      col4: "Pending",
    },
    {
      id: "3",
      col1: "ADM-1804",
      col2: "Hafsat Sani",
      col3: "Islamic Studies (hafsat@example.com)",
      col4: "Accepted",
    },
    {
      id: "4",
      col1: "ADM-1805",
      col2: "Idris Al-Hassan",
      col3: "Arabic Programme (idris@example.com)",
      col4: "Pending",
    },
  ],
  Fees: [
    {
      id: "1",
      col1: "DH-26014",
      col2: "Amina Yusuf",
      col3: "First Term Tuition (₦85,000)",
      col4: "Paid",
    },
    {
      id: "2",
      col1: "DH-26015",
      col2: "Abdullah Musa",
      col3: "First Term Tuition (₦85,000 - ₦60,000 paid)",
      col4: "₦25,000 Due",
    },
    {
      id: "3",
      col1: "DH-26016",
      col2: "Maryam Bello",
      col3: "First Term Tuition (₦85,000)",
      col4: "Paid",
    },
    {
      id: "4",
      col1: "DH-26017",
      col2: "Zayd Abubakar",
      col3: "First Term Tuition (₦85,000)",
      col4: "₦85,000 Due",
    },
  ],
  News: [
    {
      id: "1",
      col1: "Admissions",
      col2: "Assessment week announced",
      col3: "Screening starts for incoming learners",
      col4: "Published",
    },
    {
      id: "2",
      col1: "Academics",
      col2: "New Arabic texts arrive",
      col3: "Classical grammar books added to library",
      col4: "Published",
    },
    {
      id: "3",
      col1: "Campus",
      col2: "Library expansion project",
      col3: "Renovation of the main study hall",
      col4: "Draft",
    },
  ],
  Events: [
    {
      id: "1",
      col1: "Community",
      col2: "Qur’an Recitation Gathering",
      col3: "4 Oct 2026, 09:00 AM @ Main Hall",
      col4: "Upcoming",
    },
    {
      id: "2",
      col1: "Academics",
      col2: "Parent Orientation Programme",
      col3: "12 Oct 2026, 10:30 AM @ Auditorium",
      col4: "Upcoming",
    },
    {
      id: "3",
      col1: "Scholastic",
      col2: "Hadith Symposium",
      col3: "25 Oct 2026, 02:00 PM @ Hall B",
      col4: "Upcoming",
    },
  ],
};

function Dashboard() {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [active, setActive] = useState<ModuleName>("Overview");
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleData, setModuleData] = useState(initialModuleData);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; role: string }>({
    email: "portal@darulhijra.edu",
    name: "College Administrator",
    role: "Admin",
  });

  useEffect(() => {
    async function fetchUser() {
      // Check Supabase session
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          const email = data.user.email ?? "user@darulhijra.edu";
          const fullName =
            (data.user.user_metadata?.["full_name"] as string) ??
            email.split("@")[0] ??
            "Portal User";
          const role = (data.user.user_metadata?.["role"] as string) ?? "Staff";
          setCurrentUser({ email, name: fullName, role });
          return;
        }
      } catch {
        // Continue to check demo session
      }

      // Check demo session
      if (typeof window !== "undefined") {
        const demoStr = localStorage.getItem("darul_hijra_demo_user");
        if (demoStr) {
          try {
            const demoObj = JSON.parse(demoStr);
            setCurrentUser({
              email: demoObj.email ?? "admin@darulhijra.edu",
              name: demoObj.user_metadata?.full_name ?? "Demo Administrator",
              role: (demoObj.role ?? "admin").toUpperCase(),
            });
          } catch {
            // ignore
          }
        }
      }
    }

    fetchUser();
  }, []);

  // Fetch real data from Supabase for the current module where available
  useEffect(() => {
    async function loadDatabaseRows() {
      if (active === "Overview") return;

      try {
        if (active === "Students") {
          const { data } = await supabase
            .from("students")
            .select("id, admission_number, status, class_id");
          if (data && data.length > 0) {
            setModuleData((prev) => ({
              ...prev,
              Students: data.map((s, idx) => ({
                id: s.id,
                col1: s.admission_number,
                col2: `Enrolled Learner ${idx + 1}`,
                col3: s.class_id ? "Assigned Class" : "General Enrollment",
                col4: s.status.charAt(0).toUpperCase() + s.status.slice(1),
              })),
            }));
          }
        } else if (active === "Teachers") {
          const { data } = await supabase
            .from("teachers")
            .select("id, employee_number, specialization, qualification");
          if (data && data.length > 0) {
            setModuleData((prev) => ({
              ...prev,
              Teachers: data.map((t) => ({
                id: t.id,
                col1: t.employee_number,
                col2: t.specialization || "Islamic Studies Instructor",
                col3: t.qualification || "Faculty Member",
                col4: "Full-time",
              })),
            }));
          }
        } else if (active === "Classes") {
          const { data } = await supabase.from("classes").select("id, name, level, room, schedule");
          if (data && data.length > 0) {
            setModuleData((prev) => ({
              ...prev,
              Classes: data.map((c) => ({
                id: c.id,
                col1: c.level,
                col2: c.name,
                col3: `${c.room || "Room"} (${c.schedule || "Regular"})`,
                col4: "Active Class",
              })),
            }));
          }
        } else if (active === "Subjects") {
          const { data } = await supabase
            .from("subjects")
            .select("id, name, name_ar, code, description");
          if (data && data.length > 0) {
            setModuleData((prev) => ({
              ...prev,
              Subjects: data.map((sub) => ({
                id: sub.id,
                col1: sub.code,
                col2: sub.name,
                col3: `${sub.name_ar || ""} — ${sub.description || "Course study"}`,
                col4: "Active",
              })),
            }));
          }
        } else if (active === "Admissions") {
          const { data } = await supabase
            .from("admissions")
            .select("id, full_name, email, programme, status");
          if (data && data.length > 0) {
            setModuleData((prev) => ({
              ...prev,
              Admissions: data.map((a, i) => ({
                id: a.id,
                col1: `ADM-${1800 + i}`,
                col2: a.full_name,
                col3: `${a.programme} (${a.email})`,
                col4: a.status.charAt(0).toUpperCase() + a.status.slice(1),
              })),
            }));
          }
        }
      } catch {
        // Fall back gracefully to local moduleData
      }
    }

    loadDatabaseRows();
  }, [active]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    localStorage.removeItem("darul_hijra_demo_user");
    await router.invalidate();
    toast.info("Signed out of portal");
    navigate({ to: "/auth", replace: true });
  }

  function handleAddRecord(newRecord: { col1: string; col2: string; col3: string; col4: string }) {
    if (active === "Overview") return;

    const record: TableRow = {
      id: "local-" + Date.now(),
      ...newRecord,
    };

    setModuleData((prev) => ({
      ...prev,
      [active]: [record, ...(prev[active] || [])],
    }));

    toast.success(`Added new entry to ${active}`);
    setIsAddDialogOpen(false);
  }

  function handleDeleteRecord(id: string) {
    if (active === "Overview") return;
    setModuleData((prev) => ({
      ...prev,
      [active]: (prev[active] || []).filter((r) => r.id !== id),
    }));
    toast.info("Record removed");
  }

  function handleStatusChange(id: string, newStatus: string) {
    if (active === "Overview") return;
    setModuleData((prev) => ({
      ...prev,
      [active]: (prev[active] || []).map((r) => (r.id === id ? { ...r, col4: newStatus } : r)),
    }));
    toast.success(`Status updated to ${newStatus}`);
  }

  return (
    <div className="min-h-screen bg-muted/40 text-foreground flex flex-col lg:flex-row">
      {/* Mobile Drawer Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          open ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 bg-primary text-primary-foreground transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col justify-between shadow-2xl lg:shadow-none`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex h-20 items-center justify-between border-b border-primary-foreground/15 px-5">
            <Link to="/" className="flex items-center gap-3 group">
              <span className="grid size-10 place-items-center rounded-lg bg-primary-foreground/15 text-accent shadow-inner">
                <School className="size-5" />
              </span>
              <span>
                <strong className="block font-display text-base tracking-tight">DARUL HIJRA</strong>
                <small className="text-primary-foreground/75 font-semibold text-[10px] uppercase tracking-wider">
                  Management Portal
                </small>
              </span>
            </Link>
            <button
              className="lg:hidden text-primary-foreground/80 hover:text-primary-foreground p-1"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="size-6" />
            </button>
          </div>

          {/* User Profile Mini Bar */}
          <div className="mx-3 mt-4 rounded-lg bg-primary-foreground/10 p-3 flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-full bg-accent text-accent-foreground font-bold text-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-xs font-bold text-primary-foreground">
                {currentUser.name}
              </p>
              <span className="inline-block rounded bg-primary-foreground/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent">
                {currentUser.role}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 p-3 mt-2 overflow-y-auto max-h-[calc(100vh-230px)]">
            {modules.map(({ name, icon: Icon }) => (
              <button
                key={name}
                onClick={() => {
                  setActive(name);
                  setSearchTerm("");
                  setOpen(false);
                }}
                className={`flex h-11 w-full items-center justify-between rounded-lg px-3 text-sm font-semibold transition-all ${
                  active === name
                    ? "bg-primary-foreground text-primary shadow-sm"
                    : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="size-4" />
                  <span>{name}</span>
                </div>
                {name !== "Overview" && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      active === name
                        ? "bg-primary/10 text-primary"
                        : "bg-primary-foreground/15 text-primary-foreground/80"
                    }`}
                  >
                    {moduleData[name]?.length ?? 0}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Sidebar Action */}
        <div className="border-t border-primary-foreground/15 p-4">
          <Button
            variant="ghost"
            onClick={signOut}
            className="w-full justify-start text-primary-foreground/90 hover:bg-primary-foreground/15 hover:text-primary-foreground font-medium"
          >
            <LogOut className="size-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top App Bar */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b bg-card px-5 lg:px-8 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              className="text-primary lg:hidden p-1.5 rounded-md hover:bg-muted"
              onClick={() => setOpen(true)}
              aria-label="Open sidebar menu"
            >
              <Menu className="size-6" />
            </button>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                Darul Hijra School System
              </p>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">{active}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              School Website ↗
            </Link>
            <Button variant="outline" size="sm" onClick={signOut} className="font-semibold text-xs">
              <LogOut className="size-3.5 mr-1" /> Exit Portal
            </Button>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-5 lg:p-8">
          {active === "Overview" ? (
            <Overview
              setActive={(mod) => {
                setActive(mod);
                setSearchTerm("");
              }}
              counts={{
                Students: moduleData.Students.length,
                Teachers: moduleData.Teachers.length,
                Classes: moduleData.Classes.length,
                Admissions: moduleData.Admissions.length,
              }}
            />
          ) : (
            <ModuleTable
              name={active}
              data={moduleData[active] || []}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onOpenAdd={() => setIsAddDialogOpen(true)}
              onDelete={handleDeleteRecord}
              onStatusChange={handleStatusChange}
            />
          )}
        </main>
      </div>

      {/* Add New Record Modal Dialog */}
      {active !== "Overview" && (
        <AddRecordDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          moduleName={active}
          onSubmit={handleAddRecord}
        />
      )}
    </div>
  );
}

function Overview({
  setActive,
  counts,
}: {
  setActive: (value: ModuleName) => void;
  counts: { Students: number; Teachers: number; Classes: number; Admissions: number };
}) {
  const stats: Array<{
    label: ModuleName;
    title: string;
    value: string;
    sub: string;
    badge: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      label: "Students",
      title: "Total Learners",
      value: `${counts.Students} Registered`,
      sub: "Active in Tahfiz, Arabic & Studies",
      badge: "+12 this term",
      icon: GraduationCap,
    },
    {
      label: "Teachers",
      title: "Faculty Staff",
      value: `${counts.Teachers} Instructors`,
      sub: "Ustadhs & Tajweed specialists",
      badge: "Full curriculum",
      icon: Users,
    },
    {
      label: "Classes",
      title: "Active Cohorts",
      value: `${counts.Classes} Classes`,
      sub: "Foundations to Advanced Levels",
      badge: "Rooms 01 - 12",
      icon: School,
    },
    {
      label: "Admissions",
      title: "New Applicants",
      value: `${counts.Admissions} In Review`,
      sub: "Awaiting screening & placement",
      badge: "Screening Open",
      icon: UserPlus,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-primary/20 bg-card p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
            <Sparkles className="size-4" /> Academic Session 2026/2027
          </div>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold">
            Welcome to Darul Hijra College Portal
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete administration system for learner enrollment, curricula, examinations, and
            college events.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setActive("Admissions")}
            className="bg-primary text-primary-foreground"
          >
            <UserCheck className="size-4 mr-1.5" /> Review Admissions
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, title, value, sub, badge, icon: Icon }) => (
          <button
            key={label}
            onClick={() => setActive(label)}
            className="group relative rounded-xl border bg-card p-5 text-left shadow-xs transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {title}
              </span>
              <span className="grid size-9 place-items-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-4" />
              </span>
            </div>
            <strong className="mt-3 block font-display text-2xl text-primary">{value}</strong>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{sub}</span>
              <Badge variant="secondary" className="text-[10px] font-semibold">
                {badge}
              </Badge>
            </div>
          </button>
        ))}
      </div>

      {/* Schedule & Quick Operations */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Today's Schedule */}
        <section className="md:col-span-2 rounded-xl border bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Daily Operations
              </p>
              <h3 className="mt-1 text-xl font-bold">Today at Darul Hijra Campus</h3>
            </div>
            <CalendarDays className="size-6 text-primary" />
          </div>

          <div className="space-y-3">
            {[
              {
                time: "07:30 AM",
                title: "Morning Qur’an Recitation & Adhkar",
                place: "Central Courtyard & Prayer Hall",
                tag: "Compulsory",
              },
              {
                time: "09:00 AM",
                title: "Nahw (Arabic Grammar) Mid-Term Assessment",
                place: "Room 06 & Lecture Hall 2",
                tag: "Exams",
              },
              {
                time: "11:30 AM",
                title: "Tahfiz Memorisation Circles with Sheikhs",
                place: "Qur’an Recitation Annex",
                tag: "Academic",
              },
              {
                time: "02:00 PM",
                title: "College Academic Senate & Curriculum Review",
                place: "Staff Conference Room",
                tag: "Faculty",
              },
            ].map(({ time, title, place, tag }) => (
              <div
                key={time}
                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg bg-secondary/60 p-4 gap-2 hover:bg-secondary transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-bold text-primary">{time}</strong>
                    <Badge variant="outline" className="text-[10px] bg-card">
                      {tag}
                    </Badge>
                  </div>
                  <p className="mt-1 font-semibold text-sm text-foreground">{title}</p>
                  <small className="text-xs text-muted-foreground">{place}</small>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Jump Links */}
        <section className="rounded-xl border bg-card p-6 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
              Administration
            </p>
            <h3 className="mt-1 text-xl font-bold">Quick Management</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              Direct access to vital administrative workflows and record books:
            </p>

            <div className="mt-5 space-y-2">
              {(
                [
                  ["Students", "Register learner & assign class", GraduationCap],
                  ["Results", "Record exam marks & grades", ClipboardCheck],
                  ["Fees", "Verify term payments & balances", CreditCard],
                  ["News", "Broadcast campus announcement", Newspaper],
                ] as const
              ).map(([mod, desc, Icon]) => (
                <button
                  key={mod}
                  onClick={() => setActive(mod)}
                  className="w-full text-left flex items-center justify-between p-3 rounded-lg border hover:bg-muted/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-4 text-primary" />
                    <div>
                      <strong className="block text-xs font-bold">{mod}</strong>
                      <small className="text-[10px] text-muted-foreground">{desc}</small>
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ModuleTable({
  name,
  data,
  searchTerm,
  setSearchTerm,
  onOpenAdd,
  onDelete,
  onStatusChange,
}: {
  name: ModuleName;
  data: TableRow[];
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  onOpenAdd: () => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, s: string) => void;
}) {
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const q = searchTerm.toLowerCase();
    return data.filter(
      (row) =>
        row.col1.toLowerCase().includes(q) ||
        row.col2.toLowerCase().includes(q) ||
        row.col3.toLowerCase().includes(q) ||
        row.col4.toLowerCase().includes(q),
    );
  }, [data, searchTerm]);

  // Dynamic headers based on module
  const headers = useMemo(() => {
    switch (name) {
      case "Students":
        return ["Admission No.", "Full Name", "Class & Tier", "Academic Status"];
      case "Teachers":
        return ["Emp. ID", "Teacher Name", "Specialization & Role", "Employment Status"];
      case "Classes":
        return ["Level", "Class Name", "Room & Schedule", "Enrollment"];
      case "Subjects":
        return ["Code", "Subject Title", "Arabic Title & Details", "Category"];
      case "Results":
        return ["Student Name", "Subject", "Term / Academic Period", "Grade & Score"];
      case "Admissions":
        return ["Application Ref", "Applicant Name", "Programme & Contact", "Admission Status"];
      case "Fees":
        return ["Student ID", "Student Name", "Fee Schedule", "Payment Status"];
      case "News":
        return ["Category", "Headline", "Details / Excerpt", "Status"];
      case "Events":
        return ["Type", "Event Title", "Date, Time & Venue", "Status"];
      default:
        return ["Reference", "Name / Title", "Details", "Status"];
    }
  }, [name]);

  function getStatusBadge(status: string) {
    const s = status.toLowerCase();
    if (
      s.includes("active") ||
      s.includes("paid") ||
      s.includes("accepted") ||
      s.includes("published") ||
      s.includes("excellent")
    ) {
      return (
        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px]">
          {status}
        </Badge>
      );
    }
    if (s.includes("pending") || s.includes("due") || s.includes("draft")) {
      return (
        <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[11px]">
          {status}
        </Badge>
      );
    }
    if (s.includes("reviewing") || s.includes("visiting") || s.includes("upcoming")) {
      return (
        <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px]">
          {status}
        </Badge>
      );
    }
    if (s.includes("suspended") || s.includes("declined")) {
      return <Badge variant="destructive">{status}</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  }

  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-xs">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b p-5 gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
            College Records
          </p>
          <h2 className="mt-1 text-xl md:text-2xl font-bold">{name} Directory</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${name.toLowerCase()}...`}
              className="h-10 pl-9 pr-4 w-full sm:w-64 bg-card"
            />
          </div>
          <Button onClick={onOpenAdd} className="font-semibold">
            <Plus className="size-4 mr-1" /> Add {name.slice(0, -1) || name}
          </Button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm text-left">
          <thead className="bg-muted/70 text-xs uppercase font-bold text-muted-foreground border-b">
            <tr>
              <th className="px-5 py-3.5">{headers[0]}</th>
              <th className="px-5 py-3.5">{headers[1]}</th>
              <th className="px-5 py-3.5">{headers[2]}</th>
              <th className="px-5 py-3.5">{headers[3]}</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                  No records match &quot;{searchTerm}&quot; in {name}.
                </td>
              </tr>
            ) : (
              filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs font-semibold text-primary">
                    {row.col1}
                  </td>
                  <td className="px-5 py-4 font-semibold text-foreground">{row.col2}</td>
                  <td className="px-5 py-4 text-muted-foreground">{row.col3}</td>
                  <td className="px-5 py-4">{getStatusBadge(row.col4)}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      {name === "Admissions" && row.col4 === "Pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onStatusChange(row.id, "Accepted")}
                          className="h-7 text-xs px-2 text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                        >
                          <Check className="size-3 mr-1" /> Accept
                        </Button>
                      )}
                      {name === "Fees" && row.col4.includes("Due") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onStatusChange(row.id, "Paid")}
                          className="h-7 text-xs px-2 text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                        >
                          Mark Paid
                        </Button>
                      )}
                      <button
                        onClick={() => onDelete(row.id)}
                        className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                        title="Delete record"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Summary */}
      <div className="border-t bg-muted/20 px-5 py-3 text-xs text-muted-foreground flex items-center justify-between">
        <span>Showing {filteredData.length} records</span>
        <span>Darul Hijra College Academic Database</span>
      </div>
    </section>
  );
}

function AddRecordDialog({
  isOpen,
  onClose,
  moduleName,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  moduleName: ModuleName;
  onSubmit: (data: { col1: string; col2: string; col3: string; col4: string }) => void;
}) {
  const [field1, setField1] = useState("");
  const [field2, setField2] = useState("");
  const [field3, setField3] = useState("");
  const [field4, setField4] = useState("");

  useEffect(() => {
    // Set smart defaults depending on module
    if (moduleName === "Students") {
      setField1(`DH-${Math.floor(26000 + Math.random() * 900)}`);
      setField4("Active");
    } else if (moduleName === "Teachers") {
      setField1(`TH-${Math.floor(10 + Math.random() * 90)}`);
      setField4("Full-time");
    } else if (moduleName === "Admissions") {
      setField1(`ADM-${Math.floor(1800 + Math.random() * 100)}`);
      setField4("Pending");
    } else if (moduleName === "Fees") {
      setField4("Paid");
    } else if (moduleName === "News") {
      setField4("Published");
    } else if (moduleName === "Events") {
      setField4("Upcoming");
    }
  }, [moduleName, isOpen]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!field2.trim()) {
      toast.error("Please fill in the required name/title field.");
      return;
    }

    onSubmit({
      col1: field1 || "REC-" + Date.now().toString().slice(-4),
      col2: field2,
      col3: field3 || "Standard curriculum",
      col4: field4 || "Active",
    });

    setField1("");
    setField2("");
    setField3("");
    setField4("");
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="font-bold text-xl">
            Add New {moduleName.slice(0, -1) || moduleName}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Enter the details for this new {moduleName.toLowerCase()} record in the college
            registry.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
              {moduleName === "Students"
                ? "Admission Number"
                : moduleName === "Teachers"
                  ? "Employee ID"
                  : moduleName === "Classes"
                    ? "Level / Tier"
                    : moduleName === "Subjects"
                      ? "Subject Code"
                      : moduleName === "Results"
                        ? "Student Name"
                        : "Reference / Identifier"}
            </label>
            <Input
              value={field1}
              onChange={(e) => setField1(e.target.value)}
              placeholder="e.g. DH-26020"
              required
              className="h-10"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
              {moduleName === "Students" || moduleName === "Teachers" || moduleName === "Admissions"
                ? "Full Name"
                : moduleName === "Classes"
                  ? "Class Name"
                  : moduleName === "Subjects"
                    ? "Subject Title"
                    : moduleName === "Results"
                      ? "Subject Tested"
                      : "Title / Main Name"}
            </label>
            <Input
              value={field2}
              onChange={(e) => setField2(e.target.value)}
              placeholder="e.g. Usman Ahmad"
              required
              className="h-10"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
              {moduleName === "Students"
                ? "Class / Programme"
                : moduleName === "Teachers"
                  ? "Specialization & Department"
                  : moduleName === "Classes"
                    ? "Room & Time Schedule"
                    : moduleName === "Subjects"
                      ? "Arabic Name & Description"
                      : moduleName === "Results"
                        ? "Academic Term"
                        : "Details / Remarks"}
            </label>
            <Input
              value={field3}
              onChange={(e) => setField3(e.target.value)}
              placeholder="e.g. Arabic Level 2 (Room 04)"
              className="h-10"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-muted-foreground mb-1">
              {moduleName === "Results" ? "Score / Result (e.g. 90% Distinction)" : "Status"}
            </label>
            <Input
              value={field4}
              onChange={(e) => setField4(e.target.value)}
              placeholder="e.g. Active, Paid, Reviewing, etc."
              className="h-10"
            />
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Record</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
