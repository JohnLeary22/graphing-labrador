-- Graphing Labrador: production schema for Supabase (Postgres).
-- NOT applied by demo mode. Review with your school's privacy/data team before any real student data is stored.
-- Passwords are never stored here: authentication is handled by Supabase Auth (auth.users).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- people
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('student', 'teacher')),
  display_name text not null check (char_length(display_name) between 1 and 40),
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  year_level int not null check (year_level between 7 and 12),
  teacher_id uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);
create index classes_teacher_idx on public.classes (teacher_id);

create table public.enrolments (
  user_id uuid not null references public.profiles (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'inactive')),
  primary key (user_id, class_id)
);
create index enrolments_class_idx on public.enrolments (class_id);

-- ---------------------------------------------------------------- content
create table public.labs (
  id text primary key,
  name text not null,
  description text not null,
  mascot text not null,
  sequence int not null unique
);

create table public.lessons (
  id text primary key,
  lab_id text not null references public.labs (id),
  title text not null,
  learning_intentions text not null,
  success_criteria jsonb not null,
  curriculum_mappings jsonb not null default '[]'::jsonb, -- entries carry status 'draft' until a teacher validates them
  instructional_content jsonb not null,
  sequence int not null,
  unique (lab_id, sequence)
);

create table public.skills (
  id text primary key,
  name text not null,
  description text not null,
  curriculum_mapping jsonb not null default '{}'::jsonb
);

create table public.questions (
  id text primary key,
  lesson_id text references public.lessons (id),
  type text not null,
  prompt text not null,
  graph_configuration jsonb,
  skill_ids text[] not null default '{}',
  misconception_tags text[] not null default '{}',
  difficulty int not null check (difficulty between 1 and 3),
  max_marks int not null check (max_marks > 0),
  demands jsonb not null,
  feedback jsonb not null default '{}'::jsonb
);

-- Answer keys live apart from questions so students can never read them.
create table public.question_keys (
  question_id text primary key references public.questions (id) on delete cascade,
  expected_answer jsonb not null,
  answer_validation jsonb not null default '{}'::jsonb,
  rubric jsonb
);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  teacher_id uuid not null references public.profiles (id),
  question_ids text[] not null,
  settings jsonb not null default '{}'::jsonb,
  rubric jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived'))
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references public.assessments (id),
  lesson_id text references public.lessons (id),
  class_id uuid not null references public.classes (id) on delete cascade,
  assigned_to uuid[] , -- null = whole class
  start_date timestamptz not null default now(),
  due_date timestamptz,
  settings jsonb not null default '{}'::jsonb,
  check (assessment_id is not null or lesson_id is not null)
);
create index assignments_class_idx on public.assignments (class_id);

-- ---------------------------------------------------------------- evidence
create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  question_id text not null references public.questions (id),
  assignment_id uuid references public.assignments (id),
  stage text not null,
  submitted_response jsonb not null,
  is_correct boolean not null,
  marks numeric not null check (marks >= 0),
  attempt_number int not null check (attempt_number >= 1),
  hints_used int not null default 0 check (hints_used >= 0),
  error_tag text,
  pending_marking boolean not null default false,
  created_at timestamptz not null default now(),
  unique (student_id, question_id, attempt_number)
);
create index attempts_student_idx on public.attempts (student_id, created_at);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress', 'submitted', 'marked', 'released')),
  answers jsonb not null default '{}'::jsonb,
  total_marks numeric,
  feedback text,
  unique (student_id, assignment_id) -- prevents duplicate submissions
);

create table public.marks (
  attempt_id uuid primary key references public.attempts (id) on delete cascade,
  marker_id uuid not null references public.profiles (id),
  rubric_scores jsonb not null,
  total numeric not null,
  comment text not null default '',
  released boolean not null default false,
  marked_at timestamptz not null default now()
);

create table public.mastery (
  student_id uuid not null references public.profiles (id) on delete cascade,
  skill_id text not null references public.skills (id),
  evidence_count int not null default 0,
  current_level text not null check (current_level in ('no-evidence', 'emerging', 'developing', 'secure')),
  last_updated timestamptz not null default now(),
  primary key (student_id, skill_id)
);

create table public.misconception_evidence (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  misconception_id text not null,
  question_id text not null references public.questions (id),
  supporting_evidence uuid[] not null, -- attempt ids
  status text not null default 'possible' check (status in ('possible', 'likely', 'resolved'))
);

create table public.interventions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  teacher_id uuid not null references public.profiles (id),
  target_skill text not null references public.skills (id),
  strategy text not null,
  assigned_activity text,
  status text not null default 'assigned' check (status in ('assigned', 'review', 'completed')),
  follow_up_result text,
  created_at timestamptz not null default now()
);

create table public.teacher_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  teacher_id uuid not null references public.profiles (id),
  note text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- rewards
create table public.shop_items (
  id text primary key,
  name text not null,
  category text not null,
  price int not null check (price >= 0),
  asset text not null,
  rarity text not null,
  unlock_conditions jsonb not null default '{}'::jsonb
);

create table public.reward_transactions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  transaction_type text not null check (transaction_type in ('COINS', 'XP')),
  amount int not null,
  reason text not null,
  related_activity_id text,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  unique (student_id, transaction_type, idempotency_key) -- no duplicate rewards
);
create index reward_tx_student_idx on public.reward_transactions (student_id);

create table public.student_inventory (
  student_id uuid not null references public.profiles (id) on delete cascade,
  item_id text not null references public.shop_items (id),
  equipped boolean not null default false,
  acquired_at timestamptz not null default now(),
  primary key (student_id, item_id) -- one-time items cannot be bought twice
);

create table public.achievements (
  id text primary key,
  title text not null,
  description text not null,
  conditions jsonb not null
);

create table public.student_achievements (
  student_id uuid not null references public.profiles (id) on delete cascade,
  achievement_id text not null references public.achievements (id),
  earned_at timestamptz not null default now(),
  primary key (student_id, achievement_id)
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create view public.student_balances with (security_invoker = true) as
  select student_id,
         coalesce(sum(amount) filter (where transaction_type = 'COINS'), 0)::int as coins,
         coalesce(sum(amount) filter (where transaction_type = 'XP'), 0)::int as xp
  from public.reward_transactions group by student_id;

-- ---------------------------------------------------------------- access helpers
create or replace function public.is_teacher_of(student uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.enrolments e
    join public.classes c on c.id = e.class_id
    where e.user_id = student and c.teacher_id = auth.uid() and e.status = 'active'
  );
$$;

create or replace function public.is_teacher() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher');
$$;

-- ---------------------------------------------------------------- Row Level Security
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.enrolments enable row level security;
alter table public.labs enable row level security;
alter table public.lessons enable row level security;
alter table public.skills enable row level security;
alter table public.questions enable row level security;
alter table public.question_keys enable row level security;
alter table public.assessments enable row level security;
alter table public.assignments enable row level security;
alter table public.attempts enable row level security;
alter table public.submissions enable row level security;
alter table public.marks enable row level security;
alter table public.mastery enable row level security;
alter table public.misconception_evidence enable row level security;
alter table public.interventions enable row level security;
alter table public.teacher_notes enable row level security;
alter table public.shop_items enable row level security;
alter table public.reward_transactions enable row level security;
alter table public.student_inventory enable row level security;
alter table public.achievements enable row level security;
alter table public.student_achievements enable row level security;
alter table public.audit_log enable row level security;

-- profiles: own row, or students the teacher teaches. Role cannot be self-escalated (no update of role).
create policy profiles_self on public.profiles for select using (id = auth.uid() or public.is_teacher_of(id));
create policy profiles_update_self on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- classes / enrolments
create policy classes_teacher on public.classes for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy classes_student_read on public.classes for select using (exists (select 1 from public.enrolments e where e.class_id = id and e.user_id = auth.uid()));
create policy enrol_teacher on public.enrolments for all using (exists (select 1 from public.classes c where c.id = class_id and c.teacher_id = auth.uid()));
create policy enrol_self_read on public.enrolments for select using (user_id = auth.uid());

-- shared content: readable by any signed-in user; writable only by teachers.
create policy labs_read on public.labs for select using (auth.uid() is not null);
create policy lessons_read on public.lessons for select using (auth.uid() is not null);
create policy skills_read on public.skills for select using (auth.uid() is not null);
create policy questions_read on public.questions for select using (auth.uid() is not null);
create policy shop_read on public.shop_items for select using (auth.uid() is not null);
create policy achievements_read on public.achievements for select using (auth.uid() is not null);
create policy labs_write on public.labs for all using (public.is_teacher()) with check (public.is_teacher());
create policy lessons_write on public.lessons for all using (public.is_teacher()) with check (public.is_teacher());
create policy questions_write on public.questions for all using (public.is_teacher()) with check (public.is_teacher());
-- answer keys: teachers only. Students are scored by server-side functions.
create policy keys_teacher on public.question_keys for all using (public.is_teacher()) with check (public.is_teacher());

create policy assessments_owner on public.assessments for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy assignments_teacher on public.assignments for all using (exists (select 1 from public.classes c where c.id = class_id and c.teacher_id = auth.uid()));
create policy assignments_student_read on public.assignments for select using (exists (select 1 from public.enrolments e where e.class_id = assignments.class_id and e.user_id = auth.uid()));

-- evidence: students read their own; teachers read their students'. Writes go through server functions only.
create policy attempts_self_read on public.attempts for select using (student_id = auth.uid());
create policy attempts_teacher_read on public.attempts for select using (public.is_teacher_of(student_id));
create policy submissions_self on public.submissions for select using (student_id = auth.uid());
create policy submissions_teacher on public.submissions for select using (public.is_teacher_of(student_id));
create policy marks_teacher on public.marks for all using (exists (select 1 from public.attempts a where a.id = attempt_id and public.is_teacher_of(a.student_id))) with check (marker_id = auth.uid());
create policy marks_student_released on public.marks for select using (released and exists (select 1 from public.attempts a where a.id = attempt_id and a.student_id = auth.uid()));
create policy mastery_self on public.mastery for select using (student_id = auth.uid());
create policy mastery_teacher on public.mastery for select using (public.is_teacher_of(student_id));
create policy misc_teacher on public.misconception_evidence for select using (public.is_teacher_of(student_id)); -- not visible to students
create policy interventions_teacher on public.interventions for all using (teacher_id = auth.uid() and public.is_teacher_of(student_id)) with check (teacher_id = auth.uid() and public.is_teacher_of(student_id));
create policy notes_teacher on public.teacher_notes for all using (teacher_id = auth.uid() and public.is_teacher_of(student_id)) with check (teacher_id = auth.uid() and public.is_teacher_of(student_id));

-- rewards: read-only to clients. Inserts happen in security-definer functions below.
create policy tx_self_read on public.reward_transactions for select using (student_id = auth.uid());
create policy tx_teacher_read on public.reward_transactions for select using (public.is_teacher_of(student_id));
create policy inv_self_read on public.student_inventory for select using (student_id = auth.uid());
create policy sa_self_read on public.student_achievements for select using (student_id = auth.uid());
create policy audit_teacher_read on public.audit_log for select using (public.is_teacher());

-- Students may only toggle `equipped` on items they own.
create policy inv_self_equip on public.student_inventory for update using (student_id = auth.uid()) with check (student_id = auth.uid());
revoke insert, delete on public.student_inventory from authenticated;
revoke insert, update, delete on public.reward_transactions from authenticated;
revoke insert, update, delete on public.attempts from authenticated;

-- ---------------------------------------------------------------- server-side reward and purchase logic
-- Idempotent: the unique (student, type, key) constraint makes a repeat call a no-op.
create or replace function public.award_reward(p_student uuid, p_type text, p_amount int, p_reason text, p_key text, p_activity text default null)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if p_amount <= 0 then raise exception 'rewards must be positive'; end if;
  insert into reward_transactions (student_id, transaction_type, amount, reason, related_activity_id, idempotency_key)
  values (p_student, p_type, p_amount, p_reason, p_activity, p_key)
  on conflict (student_id, transaction_type, idempotency_key) do nothing;
  return found;
end $$;
revoke all on function public.award_reward from public, anon, authenticated; -- called only from trusted server code (Edge Function / other definer functions)

create or replace function public.purchase_item(p_item text) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_price int;
  v_balance int;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select price into v_price from shop_items where id = p_item;
  if v_price is null then raise exception 'unknown item'; end if;
  -- Serialise purchases per student so two concurrent calls cannot overspend.
  perform pg_advisory_xact_lock(hashtext(auth.uid()::text));
  if exists (select 1 from student_inventory where student_id = auth.uid() and item_id = p_item) then raise exception 'already owned'; end if;
  select coalesce(sum(amount), 0) into v_balance from reward_transactions where student_id = auth.uid() and transaction_type = 'COINS';
  if v_balance < v_price then raise exception 'insufficient balance'; end if;
  insert into reward_transactions (student_id, transaction_type, amount, reason, idempotency_key)
    values (auth.uid(), 'COINS', -v_price, 'Purchased ' || p_item, 'purchase:' || p_item);
  insert into student_inventory (student_id, item_id) values (auth.uid(), p_item);
  insert into audit_log (actor_id, action, detail) values (auth.uid(), 'purchase', jsonb_build_object('item', p_item, 'price', v_price));
end $$;
grant execute on function public.purchase_item to authenticated;

-- TODO (Phase 5): submit_attempt() as an Edge Function or security-definer function that reads question_keys,
-- scores the response (numeric tolerance, equivalence, plotting), writes `attempts`, and calls award_reward().
