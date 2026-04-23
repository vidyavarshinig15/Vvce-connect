import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendVerificationEmail(email: string, link: string) {
  const confirmLink = link;

  if (!resend) {
    console.error('RESEND_API_KEY is missing. Verification email skipped.');
    console.log(`Development verification link: ${confirmLink}`);
    return;
  }

  await resend.emails.send({
    from: 'VVCE Connect <onboarding@resend.dev>', // Use your verified domain here later
    to: [email],
    subject: 'Verify your VVCE Connect Account',
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h1 style="color: #2E8B57;">Welcome to VVCE Connect!</h1>
        <p>Please click the button below to verify your email address:</p>
        <a href="${confirmLink}" 
           style="display: inline-block; padding: 12px 24px; background-color: #2E8B57; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">
           Verify My Account
        </a>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          If you didn't sign up for this account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}