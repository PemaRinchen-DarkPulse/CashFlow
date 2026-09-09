const config = require('../config/env');
const ApiError = require('../utils/ApiError');

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

/**
 * Brevo's transactional endpoint, called directly. Node 24 ships fetch, so the
 * SDK would only add a dependency to build the same request.
 */
async function send({ to, name, subject, html, text }) {
  let response;
  try {
    response = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': config.brevo.apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { email: config.brevo.fromEmail, name: config.brevo.fromName },
        to: [{ email: to, name }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    // A hung or refused connection to Brevo is our outage, not the user's fault.
    console.error('Brevo request failed:', error.message);
    throw new ApiError(502, 'email_send_failed', 'Could not send the email');
  }

  if (!response.ok) {
    // Body is logged, never returned: it echoes the recipient address.
    console.error('Brevo rejected the message:', response.status, await response.text());
    throw new ApiError(502, 'email_send_failed', 'Could not send the email');
  }
}

function otpTemplate(name, code, minutes) {
  const text =
    `Hi ${name},\n\n` +
    `Your CashFlow verification code is ${code}.\n` +
    `It expires in ${minutes} minutes.\n\n` +
    `If you did not ask to create an account, you can ignore this email.`;

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#05090b;padding:32px;color:#ffffff">
      <div style="max-width:440px;margin:0 auto;background:#101a1f;border-radius:16px;padding:32px">
        <h1 style="margin:0 0 8px;font-size:20px;color:#ffffff">Verify your email</h1>
        <p style="margin:0 0 24px;font-size:14px;line-height:22px;color:#9ba7b4">
          Hi ${name}, use this code to finish setting up your CashFlow account.
        </p>
        <div style="font-size:34px;font-weight:700;letter-spacing:10px;color:#1dd75b;text-align:center;padding:18px 0;background:#17242b;border-radius:12px">
          ${code}
        </div>
        <p style="margin:24px 0 0;font-size:12px;line-height:20px;color:#65727e">
          The code expires in ${minutes} minutes. If you did not ask to create an
          account, you can ignore this email.
        </p>
      </div>
    </div>
  `;

  return { text, html };
}

/** Never log `code` — it is the whole secret. */
async function sendOtpEmail({ to, name, code }) {
  const minutes = Math.round(config.otp.ttlSeconds / 60);
  const { text, html } = otpTemplate(name, code, minutes);
  await send({
    to,
    name,
    subject: `${code} is your CashFlow verification code`,
    html,
    text,
  });
}

module.exports = { sendOtpEmail };
