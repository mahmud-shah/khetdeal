import twilio from 'twilio';

const client = process.env.TWILIO_SID
  ? twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)
  : null;

export async function sendOtpSms(phone, otp) {
  const body = `Your KhetDeal reset code is ${otp}. Valid 10 min. Do not share.`;
  if (!client) { console.log(`[SMS-MOCK] ${phone}: ${body}`); return; }
  await client.messages.create({ body, from: process.env.TWILIO_FROM, to: `+88${phone}` });
}