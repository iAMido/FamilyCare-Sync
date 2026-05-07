import { defineSecret } from 'firebase-functions/params';
import { getFirestore } from 'firebase-admin/firestore';
import { Resend } from 'resend';

export const RESEND_API_KEY = defineSecret('RESEND_API_KEY');

// The "from" address — must be a verified domain in Resend.
// Until you verify a domain, use Resend's default sandbox address.
const FROM_ADDRESS = 'FamilyCare Sync <onboarding@resend.dev>';

export async function getAllFamilyEmails(): Promise<string[]> {
  const db = getFirestore();
  const snap = await db.collection('users').get();
  return snap.docs.map(d => d.data().email as string).filter(Boolean);
}

export async function sendFamilyEmail(
  subject: string,
  htmlBody: string,
  apiKey: string
): Promise<void> {
  const emails = await getAllFamilyEmails();
  if (!emails.length) return;

  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: emails,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;direction:rtl">
        <h2 style="color:#2E7D9B">🏥 FamilyCare Sync</h2>
        ${htmlBody}
        <hr style="border:none;border-top:1px solid #eee;margin-top:24px"/>
        <p style="font-size:12px;color:#999">הודעה אוטומטית מהאפליקציה FamilyCare Sync</p>
      </div>
    `,
  });
}
