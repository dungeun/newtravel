import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '@/lib/mail/smtpMailer';

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html } = await req.json();
    if (!to || !subject || !html) {
      return NextResponse.json({ error: '필수 항목 누락' }, { status: 400 });
    }
    await sendMail({ to, subject, html });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 