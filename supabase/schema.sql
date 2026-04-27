create extension if not exists "uuid-ossp";

create table public.workflows (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  output_format text not null check (output_format in ('pdf', 'docx')),
  fields jsonb not null default '[]',
  template text not null default '',
  email_to text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.runs (
  id uuid primary key default uuid_generate_v4(),
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '{}',
  file_path text,
  file_name text,
  output_format text not null check (output_format in ('pdf', 'docx')),
  email_sent_to text,
  email_sent_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'complete', 'failed')),
  error_message text,
  created_at timestamptz not null default now()
);

create index idx_workflows_user_id on public.workflows(user_id);
create index idx_runs_workflow_id on public.runs(workflow_id);
create index idx_runs_user_id on public.runs(user_id);
create index idx_runs_created_at on public.runs(created_at desc);

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger workflows_updated_at
  before update on public.workflows
  for each row execute procedure public.handle_updated_at();

alter table public.workflows enable row level security;
alter table public.runs enable row level security;
