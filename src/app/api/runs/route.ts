import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { runCreatePayloadSchema, runFinalizePayloadSchema } from '@/lib/validation';

function createSupabase(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options });
        }
      }
    }
  );
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  const supabase = createSupabase(request, response);

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = runCreatePayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid run payload', issues: parsed.error.flatten() }, { status: 400 });
  }

  const { workflowId, data, outputFormat } = parsed.data;

  const { data: workflow, error: workflowError } = await supabase
    .from('workflows')
    .select('id, user_id, output_format')
    .eq('id', workflowId)
    .single();

  if (workflowError || !workflow || workflow.user_id !== user.id) {
    return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
  }

  if (workflow.output_format !== outputFormat) {
    return NextResponse.json({ error: 'Run payload does not match workflow output format' }, { status: 400 });
  }

  const { data: run, error } = await supabase
    .from('runs')
    .insert({
      workflow_id: workflowId,
      user_id: user.id,
      data,
      output_format: outputFormat,
      status: 'pending'
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to create run' }, { status: 500 });
  }

  return NextResponse.json({ data: run });
}

export async function PATCH(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  const supabase = createSupabase(request, response);

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = runFinalizePayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid run update payload', issues: parsed.error.flatten() }, { status: 400 });
  }

  const { runId, ...updates } = parsed.data;

  const { data: existing, error: fetchError } = await supabase
    .from('runs')
    .select('id, user_id')
    .eq('id', runId)
    .single();

  if (fetchError || !existing || existing.user_id !== user.id) {
    return NextResponse.json({ error: 'Run not found' }, { status: 404 });
  }

  const { data, error } = await supabase.from('runs').update(updates).eq('id', runId).select('id').single();

  if (error) {
    return NextResponse.json({ error: 'Failed to update run' }, { status: 500 });
  }

  return NextResponse.json({ data });
}
