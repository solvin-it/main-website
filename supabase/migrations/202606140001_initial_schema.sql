-- Marketing-site schema lives in a dedicated `solvin` schema because this Supabase
-- project also hosts another application under `public`. After applying this migration,
-- `solvin` must be added to the project's exposed schemas (Dashboard → Settings → API →
-- Exposed schemas, or the `alter role authenticator` statement at the bottom of this file)
-- so PostgREST/supabase-js can reach it. The app client sets `db: { schema: "solvin" }`.

create schema if not exists solvin;

create table solvin.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  company_name text,
  role_title text,
  phone text,
  website text,
  country text,
  source text,
  consent_to_contact boolean not null default false,
  lead_status text not null default 'new' check (lead_status in ('new','qualified','unqualified','contacted','booked_call','proposal_sent','won','lost','archived')),
  assigned_to text,
  notes text
);

create table solvin.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  lead_id uuid references solvin.leads(id) on delete set null,
  session_status text not null default 'active' check (session_status in ('active','completed','abandoned','escalated','archived')),
  current_stage text not null default 'opening',
  answer_count integer not null default 0 check (answer_count between 0 and 15),
  entry_page text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  readiness_score integer check (readiness_score between 0 and 100),
  readiness_category text,
  recommended_service text,
  summary text,
  main_workflow text,
  main_pain_point text,
  main_blocker text,
  risk_level text,
  business_impact_level text,
  follow_up_triggered boolean not null default false
);

create table solvin.chat_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid not null references solvin.chat_sessions(id) on delete cascade,
  sender text not null check (sender in ('user','assistant','system')),
  message_text text not null,
  message_type text not null default 'text' check (message_type in ('text','option_select','summary','cta','error')),
  metadata jsonb not null default '{}'::jsonb
);

create table solvin.assessment_facts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid not null references solvin.chat_sessions(id) on delete cascade,
  fact_key text not null,
  fact_value jsonb not null,
  confidence_score numeric check (confidence_score between 0 and 1),
  unique (session_id, fact_key)
);

create table solvin.readiness_scores (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid not null unique references solvin.chat_sessions(id) on delete cascade,
  workflow_clarity_score integer not null check (workflow_clarity_score between 0 and 100),
  repetition_score integer not null check (repetition_score between 0 and 100),
  data_tool_readiness_score integer not null check (data_tool_readiness_score between 0 and 100),
  business_impact_score integer not null check (business_impact_score between 0 and 100),
  risk_manageability_score integer not null check (risk_manageability_score between 0 and 100),
  total_score integer not null check (total_score between 0 and 100),
  category text not null,
  rationale text
);

create table solvin.recommendations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid not null unique references solvin.chat_sessions(id) on delete cascade,
  recommended_service text not null,
  recommendation_summary text not null,
  suggested_first_project text,
  suggested_tools text[],
  risks_to_review text[],
  next_step text,
  internal_priority text not null default 'medium' check (internal_priority in ('low','medium','high','urgent'))
);

create table solvin.follow_ups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  lead_id uuid references solvin.leads(id) on delete cascade,
  session_id uuid references solvin.chat_sessions(id) on delete cascade,
  follow_up_type text not null check (follow_up_type in ('send_summary_email','notify_internal','create_crm_record','send_booking_link','send_case_study','send_reminder','mark_abandoned_chat')),
  status text not null default 'pending' check (status in ('pending','processing','completed','failed','cancelled')),
  scheduled_at timestamptz,
  completed_at timestamptz,
  error_message text,
  unique (session_id, follow_up_type)
);

create index chat_sessions_status_created_idx on solvin.chat_sessions(session_status, created_at desc);
create index chat_sessions_lead_idx on solvin.chat_sessions(lead_id);
create index chat_messages_session_created_idx on solvin.chat_messages(session_id, created_at);
create index follow_ups_status_scheduled_idx on solvin.follow_ups(status, scheduled_at);

alter table solvin.leads enable row level security;
alter table solvin.chat_sessions enable row level security;
alter table solvin.chat_messages enable row level security;
alter table solvin.assessment_facts enable row level security;
alter table solvin.readiness_scores enable row level security;
alter table solvin.recommendations enable row level security;
alter table solvin.follow_ups enable row level security;

-- Server-only access: the service_role (the sb_secret_ key) bypasses RLS. No anon/
-- authenticated policies are created, so public clients cannot read leads or transcripts.
grant usage on schema solvin to anon, authenticated, service_role;
grant all privileges on all tables in schema solvin to service_role;
grant all privileges on all sequences in schema solvin to service_role;
alter default privileges in schema solvin grant all on tables to service_role;
alter default privileges in schema solvin grant all on sequences to service_role;

-- Expose `solvin` to PostgREST so supabase-js can query it. Prefer setting this in the
-- dashboard (Settings → API → Exposed schemas) so it survives config changes; this
-- statement is the equivalent and is additive to the existing exposed schemas.
alter role authenticator set pgrst.db_schemas = 'public, graphql_public, solvin';
notify pgrst, 'reload config';
