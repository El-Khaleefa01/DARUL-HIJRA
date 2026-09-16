CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  phone text CHECK (phone IS NULL OR char_length(phone) <= 30),
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can create own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'student',
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE CHECK (char_length(name) <= 80),
  level text NOT NULL CHECK (char_length(level) <= 50),
  room text CHECK (char_length(room) <= 40),
  schedule text CHECK (char_length(schedule) <= 200),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read classes" ON public.classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage classes" ON public.classes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE CHECK (char_length(name) <= 100),
  name_ar text CHECK (char_length(name_ar) <= 100),
  code text NOT NULL UNIQUE CHECK (char_length(code) <= 20),
  description text CHECK (char_length(description) <= 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subjects TO authenticated;
GRANT ALL ON public.subjects TO service_role;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read subjects" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage subjects" ON public.subjects FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE,
  admission_number text NOT NULL UNIQUE CHECK (char_length(admission_number) <= 30),
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  guardian_name text CHECK (char_length(guardian_name) <= 100),
  guardian_phone text CHECK (char_length(guardian_phone) <= 30),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','graduated','suspended')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own record" ON public.students FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY "Staff read students" ON public.students FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Admins manage students" ON public.students FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE,
  employee_number text NOT NULL UNIQUE CHECK (char_length(employee_number) <= 30),
  specialization text CHECK (char_length(specialization) <= 120),
  qualification text CHECK (char_length(qualification) <= 160),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teachers TO authenticated;
GRANT ALL ON public.teachers TO service_role;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read teachers" ON public.teachers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage teachers" ON public.teachers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  term text NOT NULL CHECK (char_length(term) <= 40),
  score numeric(5,2) NOT NULL CHECK (score BETWEEN 0 AND 100),
  remarks text CHECK (char_length(remarks) <= 300),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, subject_id, term)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.results TO authenticated;
GRANT ALL ON public.results TO service_role;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own results" ON public.results FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.profile_id = auth.uid()));
CREATE POLICY "Staff read results" ON public.results FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Staff manage results" ON public.results FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher')) WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));

CREATE TABLE public.fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  term text NOT NULL CHECK (char_length(term) <= 40),
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  amount_paid numeric(12,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fees TO authenticated;
GRANT ALL ON public.fees TO service_role;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own fees" ON public.fees FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.profile_id = auth.uid()));
CREATE POLICY "Admins manage fees" ON public.fees FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.admissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id uuid NOT NULL DEFAULT auth.uid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 100),
  email text NOT NULL CHECK (char_length(email) <= 255),
  phone text NOT NULL CHECK (char_length(phone) <= 30),
  programme text NOT NULL CHECK (char_length(programme) <= 100),
  previous_school text CHECK (char_length(previous_school) <= 150),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewing','accepted','declined')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admissions TO authenticated;
GRANT ALL ON public.admissions TO service_role;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Applicants create own admission" ON public.admissions FOR INSERT TO authenticated WITH CHECK (applicant_id = auth.uid());
CREATE POLICY "Applicants read own admission" ON public.admissions FOR SELECT TO authenticated USING (applicant_id = auth.uid());
CREATE POLICY "Admins manage admissions" ON public.admissions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 160),
  excerpt text NOT NULL CHECK (char_length(excerpt) <= 500),
  published_at timestamptz NOT NULL DEFAULT now(),
  is_published boolean NOT NULL DEFAULT false
);
GRANT SELECT ON public.news TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news TO authenticated;
GRANT ALL ON public.news TO service_role;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published news" ON public.news FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins manage news" ON public.news FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 160),
  details text NOT NULL CHECK (char_length(details) <= 1000),
  starts_at timestamptz NOT NULL,
  venue text CHECK (char_length(venue) <= 120),
  is_published boolean NOT NULL DEFAULT false
);
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published events" ON public.events FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins manage events" ON public.events FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name',''), split_part(NEW.email, '@', 1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();