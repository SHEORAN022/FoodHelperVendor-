const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendOTP = async (to, otp) => {
  return resend.emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to,
    subject: "Your Login OTP",
    html: `
      <h2>Your OTP</h2>
      <h1>${otp}</h1>
      <p>This OTP will expire in 5 minutes.</p>
    `,
  });
};
