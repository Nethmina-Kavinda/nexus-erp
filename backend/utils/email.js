/**
 * Email dispatch via Gmail SMTP. Requires an App Password in
 * OTP_EMAIL_PASSWORD (regular Gmail passwords are rejected by SMTP since
 * 2022). When SKIP_OTP=true the auth controller never invokes this module.
 */
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.OTP_EMAIL,
    pass: process.env.OTP_EMAIL_PASSWORD,
  },
});

/**
 * Send a 6-digit OTP for email verification. Throws on SMTP failure so the
 * caller surfaces a 5xx — OTP delivery is a hard requirement of registration.
 */
const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: `"NEXUS ERP" <${process.env.OTP_EMAIL}>`,
    to,
    subject: 'NEXUS ERP — Email Verification OTP',
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: auto;">
        <h2>Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1 style="letter-spacing: 8px; color: #3B82F6;">${otp}</h1>
        <p>This code expires in 5 minutes.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send an operational alert (e.g. inventory reorder). Failures are logged
 * but swallowed: a missed alert email must never fail the originating
 * inventory-shipment transaction.
 */
const sendAlertEmail = async (to, subject, body) => {
  const mailOptions = {
    from: `"NEXUS ERP Alerts" <${process.env.OTP_EMAIL}>`,
    to,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
        <h2>${subject}</h2>
        <p>${body}</p>
        <hr />
        <p style="color: #666; font-size: 12px;">NEXUS ERP Automated Alert</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Alert email failed:', error.message);
  }
};

module.exports = { sendOtpEmail, sendAlertEmail };
