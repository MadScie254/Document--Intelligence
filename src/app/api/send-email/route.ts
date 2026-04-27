import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { to, subject, body, runId } = await req.json();

  if (!to || !subject) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'FlowForge <onboarding@resend.dev>',
      to: Array.isArray(to) ? to : [to],
      subject,
      text: body
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, emailId: data?.id, runId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
