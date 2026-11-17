-- =====================================================================
-- BASYA ENGLISH OLYMPIA — Core schema
-- Tables, enums, reference data and Row Level Security (RLS) policies.
-- =====================================================================

-- ---------- Enums ----------
create type public.cefr_level as enum ('A1', 'A2', 'B1', 'B2');
create type public.school_level as enum ('SMP', 'SMA');
create type public.learning_mode as enum ('proficiency', 'olympiad');
create type public.difficulty_level as enum ('easy', 'medium', 'hard', 'advanced');
create type public.publication_status as enum ('draft', 'published');
create type public.assessment_type as enum (
  'diagnostic', 'formative', 'summative', 'daily_practice', 'olympiad_simulation'
);
create type public.quiz_mode as enum ('practice', 'exam');
create type public.attempt_status as enum ('in_progress', 'submitted');

-- ---------- Roles ----------
create table public.roles (
  id text primary key check (id in ('student', 'teacher', 'admin')),
  name text not null,
  description text
);

insert into public.roles (id, name, description) values
  ('student', 'Student', 'Learns, practises and takes assessments.'),
  ('teacher', 'Teacher', 'Manages authorised classes, assignments and reports.'),
  ('admin', 'Super Admin', 'Full platform management (Ma''am Basya).');

-- ---------- Profiles ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'student' references public.roles (id),
  school_level public.school_level,
  grade smallint check (grade between 7 and 12),
  school_name text,
  bio text,
  cefr_level public.cefr_level,            -- placement from diagnostic; null until placed
  cefr_placed_at timestamptz,
  xp integer not null default 0 check (xp >= 0),
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_active_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_role_idx on public.profiles (role);

-- ---------- Classes & enrollments ----------
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  description text,
  school_level public.school_level,
  teacher_id uuid references public.profiles (id) on delete set null,
  join_code text not null unique default upper(substr(md5(gen_random_uuid()::text), 1, 6)),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index classes_teacher_idx on public.classes (teacher_id);

create table public.enrollments (
  class_id uuid not null references public.classes (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, student_id)
);
create index enrollments_student_idx on public.enrollments (student_id);

-- ---------- Question bank ----------
create table public.question_categories (
  id smallserial primary key,
  slug text not null unique,
  name text not null,
  description text,
  sort_order smallint not null default 0
);

insert into public.question_categories (slug, name, description, sort_order) values
  ('grammar', 'Grammar', 'Sentence structure, tenses and grammatical accuracy.', 1),
  ('vocabulary', 'Vocabulary', 'Word meaning, collocation and word formation.', 2),
  ('reading', 'Reading Comprehension', 'Understanding main ideas, details and inferences in texts.', 3),
  ('language-use', 'Language Use', 'Choosing appropriate expressions for context and register.', 4),
  ('text-analysis', 'Text Analysis', 'Purpose, structure and language features of texts.', 5),
  ('hots', 'HOTS', 'Higher-order thinking: analysing, evaluating and creating.', 6),
  ('olympiad-reasoning', 'Olympiad Reasoning', 'Logic and reasoning challenges in English.', 7);

create sequence public.question_code_seq start 1;

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('BEO-' || lpad(nextval('public.question_code_seq')::text, 5, '0')),
  cefr_level public.cefr_level,                       -- optional for Olympiad questions
  school_level public.school_level,                   -- null = suitable for both SMP & SMA
  learning_mode public.learning_mode not null,
  category_id smallint not null references public.question_categories (id),
  subcategory text,
  difficulty public.difficulty_level not null default 'medium',
  question_text text not null check (char_length(question_text) > 0),
  passage text,
  explanation text not null default '',
  distractor_analysis text,
  learning_objective text,
  skill_assessed text,
  status public.publication_status not null default 'draft',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint proficiency_needs_cefr check (learning_mode <> 'proficiency' or cefr_level is not null)
);
create index questions_filter_idx on public.questions (status, learning_mode, cefr_level, school_level, category_id);
create index questions_category_idx on public.questions (category_id);

create table public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  label char(1) not null check (label in ('A', 'B', 'C', 'D')),
  option_text text not null,
  is_correct boolean not null default false,
  unique (question_id, label)
);
-- Exactly one correct option per question (at most one enforced here; "at least one" enforced in save function)
create unique index question_options_one_correct on public.question_options (question_id) where is_correct;

create table public.question_tags (
  question_id uuid not null references public.questions (id) on delete cascade,
  tag text not null check (char_length(tag) between 1 and 40),
  primary key (question_id, tag)
);

-- ---------- Assessment packages ----------
create table public.quiz_packages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  assessment_type public.assessment_type not null,
  learning_mode public.learning_mode not null,
  mode public.quiz_mode not null default 'exam',
  target_cefr public.cefr_level,
  school_level public.school_level,
  category_id smallint references public.question_categories (id),
  question_count smallint not null default 10 check (question_count between 1 and 100),
  time_limit_minutes smallint check (time_limit_minutes is null or time_limit_minutes between 1 and 240),
  passing_score smallint not null default 70 check (passing_score between 0 and 100),
  status public.publication_status not null default 'draft',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional fixed question list. When empty, questions are drawn randomly using the package filters.
create table public.quiz_questions (
  package_id uuid not null references public.quiz_packages (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  position smallint not null default 0,
  primary key (package_id, question_id)
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  package_id uuid not null references public.quiz_packages (id) on delete cascade,
  title text not null,
  instructions text,
  due_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index assignments_class_idx on public.assignments (class_id);

-- ---------- Attempts & answers ----------
create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  package_id uuid references public.quiz_packages (id) on delete set null,
  assignment_id uuid references public.assignments (id) on delete set null,
  title text not null,
  mode public.quiz_mode not null,
  assessment_type public.assessment_type not null,
  learning_mode public.learning_mode not null,
  cefr_level public.cefr_level,
  school_level public.school_level,
  category_id smallint references public.question_categories (id),
  passing_score smallint not null default 70,
  time_limit_minutes smallint,
  started_at timestamptz not null default now(),
  expires_at timestamptz,
  submitted_at timestamptz,
  status public.attempt_status not null default 'in_progress',
  total_questions smallint not null default 0,
  correct_count smallint,
  score numeric(5, 2),
  passed boolean,
  xp_earned integer not null default 0,
  placement_result public.cefr_level
);
create index quiz_attempts_student_idx on public.quiz_attempts (student_id, started_at desc);
create index quiz_attempts_status_idx on public.quiz_attempts (status, started_at);

create table public.attempt_questions (
  attempt_id uuid not null references public.quiz_attempts (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  position smallint not null,
  option_order uuid[] not null,          -- randomised option order shown to this student
  primary key (attempt_id, question_id)
);

create table public.student_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  selected_option_id uuid references public.question_options (id) on delete set null,
  is_correct boolean not null,
  answered_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);
create index student_answers_student_idx on public.student_answers (student_id);
create index student_answers_question_idx on public.student_answers (question_id);

-- ---------- Gamification ----------
create table public.achievements (
  id smallserial primary key,
  code text not null unique,
  name text not null,
  description text not null,
  icon text not null default 'award',
  xp_reward integer not null default 0
);

insert into public.achievements (code, name, description, icon, xp_reward) values
  ('first_step', 'First Step', 'Complete your first quiz or assessment.', 'footprints', 20),
  ('grammar_explorer', 'Grammar Explorer', 'Answer 20 grammar questions correctly.', 'puzzle', 50),
  ('reading_champion', 'Reading Champion', 'Answer 20 reading comprehension questions correctly.', 'book-open', 50),
  ('vocabulary_master', 'Vocabulary Master', 'Answer 20 vocabulary questions correctly.', 'languages', 50),
  ('olympiad_fighter', 'Olympiad Fighter', 'Complete an Olympiad quiz or simulation.', 'trophy', 40),
  ('consistency_star', 'Consistency Star', 'Keep a 7-day learning streak.', 'flame', 70);

create table public.student_achievements (
  student_id uuid not null references public.profiles (id) on delete cascade,
  achievement_id smallint not null references public.achievements (id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (student_id, achievement_id)
);

create table public.xp_transactions (
  id bigserial primary key,
  student_id uuid not null references public.profiles (id) on delete cascade,
  amount integer not null,
  reason text not null,
  source_type text not null,          -- 'attempt' | 'achievement'
  source_id text,
  created_at timestamptz not null default now()
);
create index xp_transactions_student_idx on public.xp_transactions (student_id, created_at desc);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience text not null default 'all' check (audience in ('all', 'students', 'teachers')),
  class_id uuid references public.classes (id) on delete cascade,
  published boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- Helper functions used by RLS (SECURITY DEFINER avoids recursive RLS)
-- =====================================================================
create or replace function public.current_app_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('admin', 'teacher') from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.teaches_class(p_class_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.classes where id = p_class_id and teacher_id = auth.uid());
$$;

create or replace function public.teaches_student(p_student_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.enrollments e
    join public.classes c on c.id = e.class_id
    where e.student_id = p_student_id and c.teacher_id = auth.uid()
  );
$$;

create or replace function public.can_view_student(p_student_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select p_student_id = auth.uid() or public.is_admin() or public.teaches_student(p_student_id);
$$;

-- ---------- New user → profile (always a student; roles are changed only by admin) ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, school_level, grade, school_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'school_level', '')::public.school_level,
    nullif(new.raw_user_meta_data ->> 'grade', '')::smallint,
    nullif(trim(new.raw_user_meta_data ->> 'school_name'), '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- updated_at maintenance ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger questions_touch before update on public.questions
  for each row execute function public.touch_updated_at();
create trigger quiz_packages_touch before update on public.quiz_packages
  for each row execute function public.touch_updated_at();

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.enrollments enable row level security;
alter table public.question_categories enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.question_tags enable row level security;
alter table public.quiz_packages enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.assignments enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.attempt_questions enable row level security;
alter table public.student_answers enable row level security;
alter table public.achievements enable row level security;
alter table public.student_achievements enable row level security;
alter table public.xp_transactions enable row level security;
alter table public.announcements enable row level security;

-- Reference data readable by any signed-in user
create policy "roles readable" on public.roles for select to authenticated using (true);
create policy "categories readable" on public.question_categories for select to authenticated using (true);
create policy "categories admin write" on public.question_categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "achievements readable" on public.achievements for select to authenticated using (true);

-- Profiles
create policy "profiles select" on public.profiles for select to authenticated
  using (public.can_view_student(id) or public.is_staff() and role in ('teacher', 'admin'));
create policy "profiles self update" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
-- Students may only change these columns themselves; role/xp/streak/CEFR are changed by secure functions.
revoke update on public.profiles from authenticated, anon;
grant update (full_name, school_level, grade, school_name, bio) on public.profiles to authenticated;

-- Classes
create policy "classes select" on public.classes for select to authenticated
  using (
    public.is_admin() or teacher_id = auth.uid()
    or exists (select 1 from public.enrollments e where e.class_id = classes.id and e.student_id = auth.uid())
  );
create policy "classes admin write" on public.classes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "classes teacher update" on public.classes for update to authenticated
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

-- Enrollments (students join via join_class(); teachers/admin manage)
create policy "enrollments select" on public.enrollments for select to authenticated
  using (student_id = auth.uid() or public.is_admin() or public.teaches_class(class_id));
create policy "enrollments staff write" on public.enrollments for all to authenticated
  using (public.is_admin() or public.teaches_class(class_id))
  with check (public.is_admin() or public.teaches_class(class_id));
create policy "enrollments student leave" on public.enrollments for delete to authenticated
  using (student_id = auth.uid());

-- Questions & options: students NEVER read these tables directly (they use secure quiz functions).
create policy "questions staff read" on public.questions for select to authenticated
  using (public.is_admin() or (public.is_staff() and status = 'published'));
create policy "questions admin write" on public.questions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "options staff read" on public.question_options for select to authenticated
  using (public.is_staff());
create policy "options admin write" on public.question_options for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "tags staff read" on public.question_tags for select to authenticated using (public.is_staff());
create policy "tags admin write" on public.question_tags for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Packages: published package metadata is visible to everyone signed in
create policy "packages read" on public.quiz_packages for select to authenticated
  using (status = 'published' or public.is_staff());
create policy "packages admin write" on public.quiz_packages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "quiz_questions staff read" on public.quiz_questions for select to authenticated
  using (public.is_staff());
create policy "quiz_questions admin write" on public.quiz_questions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Assignments
create policy "assignments read" on public.assignments for select to authenticated
  using (
    public.is_admin() or public.teaches_class(class_id)
    or exists (select 1 from public.enrollments e where e.class_id = assignments.class_id and e.student_id = auth.uid())
  );
create policy "assignments staff write" on public.assignments for all to authenticated
  using (public.is_admin() or public.teaches_class(class_id))
  with check (public.is_admin() or public.teaches_class(class_id));

-- Attempts: read-only for clients; created/updated exclusively through secure functions
create policy "attempts read" on public.quiz_attempts for select to authenticated
  using (public.can_view_student(student_id));
create policy "attempt_questions read" on public.attempt_questions for select to authenticated
  using (exists (select 1 from public.quiz_attempts a where a.id = attempt_id and public.can_view_student(a.student_id)));
-- Answers become visible to the student only once correctness may be revealed
create policy "answers read" on public.student_answers for select to authenticated
  using (
    public.is_admin() or public.teaches_student(student_id)
    or (student_id = auth.uid() and exists (
      select 1 from public.quiz_attempts a
      where a.id = attempt_id and (a.status = 'submitted' or a.mode = 'practice')
    ))
  );

-- Gamification (read-only for clients)
create policy "student_achievements read" on public.student_achievements for select to authenticated
  using (public.can_view_student(student_id));
create policy "xp read" on public.xp_transactions for select to authenticated
  using (public.can_view_student(student_id));

-- Announcements
create policy "announcements read" on public.announcements for select to authenticated
  using (
    public.is_admin() or created_by = auth.uid()
    or (published and (
      class_id is null and (audience = 'all'
        or (audience = 'students' and public.current_app_role() = 'student')
        or (audience = 'teachers' and public.current_app_role() = 'teacher'))
      or class_id is not null and (public.teaches_class(class_id)
        or exists (select 1 from public.enrollments e where e.class_id = announcements.class_id and e.student_id = auth.uid()))
    ))
  );
create policy "announcements admin write" on public.announcements for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Anonymous visitors get nothing
revoke all on all tables in schema public from anon;
