-- Optional initial seed data for Darul Hijra Arabic & Islamic College
-- Inserts foundational classes, subjects, published news, and upcoming campus events.

INSERT INTO public.classes (name, level, room, schedule) VALUES
  ('Arabic Level 1 (Foundations)', 'Beginner', 'Room 04', 'Mon-Fri 08:00 - 13:00'),
  ('Arabic Level 2 (Intermediate)', 'Intermediate', 'Room 06', 'Mon-Thu 08:00 - 13:00'),
  ('Tahfiz 1 (Memorisation Tier)', 'All Levels', 'Qur’an Recitation Hall', 'Daily 06:30 - 12:00'),
  ('Islamic Studies 3 (Advanced)', 'Senior Level', 'Room 11', 'Mon-Wed 10:00 - 14:00')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.subjects (name, name_ar, code, description) VALUES
  ('Qur’an & Tajweed', 'القرآن الكريم والتجويد', 'QUR101', 'Practical recitation, rules of Tajweed, and systematic memorisation.'),
  ('Arabic Grammar (Nahw)', 'النحو العربي', 'ARB201', 'Classical and applied syntactic grammar structures and parsing.'),
  ('Arabic Morphology (Sarf)', 'الصرف العربي', 'ARB202', 'Word derivation, verbal conjugations and patterns.'),
  ('Islamic Jurisprudence (Fiqh)', 'الفقه الإسلامي', 'FIQ301', 'Rulings of worship (Taharah, Salah, Zakah, Sawm, Hajj) and transactions.'),
  ('Hadith & Prophetic Traditions', 'الحديث النبوي الشريف', 'HAD102', 'Selections of prophetic sayings and principles of Hadith terminology.'),
  ('Islamic History & Seerah', 'السيرة النبوية والتاريخ الإسلامي', 'SIR103', 'Chronological life of the Prophet ﷺ and early Islamic civilisation.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.news (title, excerpt, is_published, published_at) VALUES
  ('Admissions Open for 2026/2027 Academic Year', 'Applications for full-time Arabic and Tahfiz programmes are now being accepted online.', true, now() - interval '2 days'),
  ('New Classical Arabic Texts Arrive in Library', 'The college library has received advanced reference books in grammar and Quranic exegesis.', true, now() - interval '5 days'),
  ('Term Assessment Timetable Announced', 'Mid-term evaluations for all levels will commence at the central exam halls next week.', true, now() - interval '8 days')
ON CONFLICT DO NOTHING;

INSERT INTO public.events (title, details, starts_at, venue, is_published) VALUES
  ('Annual Qur’an Recitation Exhibition', 'Gathering of young reciters and competition in melodious, accurate recitation.', now() + interval '18 days', 'College Main Auditorium', true),
  ('First-Term Parents & Teachers Conference', 'Orientation on curriculum goals, academic performance tracking, and student tarbiyah.', now() + interval '26 days', 'Conference Hall', true),
  ('Hadith Studies Symposium', 'Public academic lecture on Prophetic traditions and ethics for contemporary youth.', now() + interval '39 days', 'Imam Bukhari Lecture Hall', true)
ON CONFLICT DO NOTHING;
