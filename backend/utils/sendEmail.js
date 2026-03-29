const Mailjet = require("node-mailjet");
const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_API_SECRET
);

const sendVerificationEmail = async (toEmail, userName, verificationToken) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const verifyLink = `${frontendUrl}/verify-email?token=${verificationToken}`;

    const request = mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_FROM_EMAIL,
            Name: process.env.MAILJET_FROM_NAME || "MediScan",
          },
          To: [
            {
              Email: toEmail,
              Name: userName,
            },
          ],
          Subject: "Verify your MediScan account ✉️",
          HTMLPart: `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f23; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.5px;">🏥 MediScan</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Your AI-Powered Medical Report Analyzer</p>
          </div>
          <div style="padding: 36px 30px;">
            <h2 style="color: #e2e8f0; margin: 0 0 16px; font-size: 22px;">Verify Your Email</h2>
            <p style="color: #94a3b8; line-height: 1.7; margin: 0 0 12px;">Hi <strong style="color: #c7d2fe;">${userName}</strong>,</p>
            <p style="color: #94a3b8; line-height: 1.7; margin: 0 0 28px;">Thank you for signing up! Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${verifyLink}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-weight: 600; font-size: 16px; letter-spacing: 0.3px;">Verify Email Address</a>
            </div>
            <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0 0 8px;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="color: #818cf8; font-size: 12px; word-break: break-all; background: rgba(99,102,241,0.1); padding: 12px; border-radius: 8px; margin: 0 0 28px;">${verifyLink}</p>
            <p style="color: #64748b; font-size: 13px; margin: 0;">This link expires in 24 hours.</p>
          </div>
          <div style="padding: 20px 30px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
            <p style="color: #475569; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} MediScan. All rights reserved.</p>
          </div>
        </div>`,
          TextPart: `Hi ${userName},\n\nThank you for signing up for MediScan!\n\nPlease verify your email by visiting this link:\n${verifyLink}\n\nThis link expires in 24 hours.\n\nBest regards,\nThe MediScan Team`,
        },
      ],
    });

    await request;
    console.log(`Verification email sent to ${toEmail}`);
  } catch (error) {
    console.error("Error sending verification email:", error.message);
  }
};

module.exports = { sendVerificationEmail };
