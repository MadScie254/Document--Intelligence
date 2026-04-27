import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createSupabase(request);

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: workflow, error: fetchError } = await supabase
    .from('workflows')
    .select('id, user_id')
    .eq('id', params.id)
    .single();

  if (fetchError || !workflow || workflow.user_id !== user.id) {
    return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
  }

  const { error } = await supabase.from('workflows').delete().eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete workflow' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}