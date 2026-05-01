import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function sendResetEmail(to, rawToken, name) {
  const url = `${process.env.APP_URL}/reset-password?token=${encodeURIComponent(rawToken)}`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto">
      <h2 style="color:#15803d">KhetDeal — Password Reset</h2>
      <p>Hello ${name || 'there'},</p>
      <p>Use the link below to reset your password. It expires in 30 minutes and works only once.</p>
      <p><a href="${url}" style="background:#15803d;color:#fff;padding:10px 18px;
              border-radius:8px;text-decoration:none;display:inline-block">Reset Password</a></p>
      <p style="color:#666;font-size:12px">If you didn't request this, ignore this email.</p>
    </div>`;

  await transporter.sendMail({
    from: `"KhetDeal" <${process.env.SMTP_FROM}>`,
    to, subject: 'Reset your KhetDeal password', html,
  });
}