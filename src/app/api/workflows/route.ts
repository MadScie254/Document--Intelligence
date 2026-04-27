import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { workflowPayloadSchema } from '@/lib/validation';

function createSupabase(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set() {},
        remove() {}
      }
    }
  );
}

export async function POST(request: NextRequest) {
  const supabase = createSupabase(request);

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = workflowPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid workflow payload', issues: parsed.error.flatten() }, { status: 400 });
  }

  const workflow = parsed.data;
  const payload = {
    user_id: user.id,
    title: workflow.title,
    description: workflow.description ?? null,
    output_format: workflow.output_format,
    fields: workflow.fields,
    template: workflow.template,
    email_to: workflow.email_to ?? null,
    is_active: workflow.is_active ?? true
  };

  if (workflow.id) {
    const { data: existing, error: fetchError } = await supabase
      .from('workflows')
      .select('id, user_id')
      .eq('id', workflow.id)
      .single();

    if (fetchError || !existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const { data, error } = await supabase.from('workflows').update(payload).eq('id', workflow.id).select('id').single();
    if (error) {
      return NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 });
    }

    return NextResponse.json({ data });
  }

  const { data, error } = await supabase.from('workflows').insert(payload).select('id').single();
  if (error) {
    return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 });
  }

  return NextResponse.json({ data });
}
