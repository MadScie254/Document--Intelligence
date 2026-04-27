import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: NextRequest) {
  const { to, subject, body, runId } = await req.json();

  if (!to || !subject) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error('Missing Resend API key');
    }

    const resend = new Resend(apiKey);

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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Email sending failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
