export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  body: string;
  runId?: string;
}

export async function sendEmail(payload: SendEmailPayload) {
  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Unable to send email');
  }

  return response.json();
}
