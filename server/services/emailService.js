import dotenv from "dotenv";
dotenv.config();

/**
 * Low-level function to dispatch transactional email via Brevo REST API v3.
 *
 * @param {Object} options
 * @param {string} options.toEmail - Recipient email address
 * @param {string} [options.toName] - Recipient name
 * @param {string} options.subject - Email subject
 * @param {string} options.htmlContent - HTML body content
 * @returns {Promise<Object>} Brevo API response summary
 */
export const sendTransactionalEmail = async ({ toEmail, toName = "", subject, htmlContent }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "wadialzaitoon.travel@gmail.com";
  const senderName = process.env.BREVO_SENDER_NAME || "WadiAlZaitoon Travels";

  if (!apiKey || apiKey.trim() === "") {
    console.error("[EmailService Error]: BREVO_API_KEY environment variable is not configured.");
    throw new Error("Email service configuration error. Please contact administrator.");
  }

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [
      {
        email: toEmail,
        ...(toName ? { name: toName } : {}),
      },
    ],
    subject: subject,
    htmlContent: htmlContent,
  };

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown Brevo API error" }));
      console.error("[EmailService Error]: Brevo API responded with status", response.status, errorData.message || "");
      throw new Error("Failed to send email message. Please try again later.");
    }

    const data = await response.json();
    return { success: true, messageId: data.messageId };
  } catch (error) {
    if (error.message && error.message.includes("Email service configuration error")) {
      throw error;
    }
    console.error("[EmailService Error]: Email delivery failed:", error.message || error);
    throw new Error("Unable to deliver email at this time. Please try again later.");
  }
};

/**
 * Send Email Verification OTP email via Brevo
 *
 * @param {string} toEmail
 * @param {string} otp
 * @returns {Promise<Object>}
 */
export const sendVerificationEmail = async (toEmail, otp) => {
  const subject = "Verify your Wadi Al Zaitoon account";
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Email Verification - Wadi Al Zaitoon</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #333333;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div style="background-color: #0f172a; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 0.5px;">Wadi Al Zaitoon</h1>
          <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 14px;">Travels & Tourism</p>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="font-size: 20px; color: #1e293b; margin-top: 0;">Email Verification Code</h2>
          <p style="font-size: 15px; line-height: 1.5; color: #475569;">
            Thank you for registering with Wadi Al Zaitoon Travels. Please use the following 6-digit verification code to complete your registration:
          </p>
          <div style="background-color: #f1f5f9; border-radius: 6px; padding: 16px; text-align: center; margin: 24px 0; border: 1px dashed #cbd5e1;">
            <span style="font-size: 32px; font-weight: bold; font-family: monospace; letter-spacing: 6px; color: #0f172a;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #64748b;">
            This code is valid for <strong>10 minutes</strong>. For your security, do not share this code with anyone.
          </p>
          <p style="font-size: 13px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            If you did not create an account with Wadi Al Zaitoon, you can safely ignore this email.
          </p>
        </div>
        <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
          &copy; ${new Date().getFullYear()} Wadi Al Zaitoon Travels. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendTransactionalEmail({ toEmail, subject, htmlContent });
};

/**
 * Send Password Reset OTP email via Brevo
 *
 * @param {string} toEmail
 * @param {string} otp
 * @returns {Promise<Object>}
 */
export const sendPasswordResetEmail = async (toEmail, otp) => {
  const subject = "Reset your Wadi Al Zaitoon password";
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset - Wadi Al Zaitoon</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #333333;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div style="background-color: #0f172a; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 0.5px;">Wadi Al Zaitoon</h1>
          <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 14px;">Travels & Tourism</p>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="font-size: 20px; color: #1e293b; margin-top: 0;">Password Reset Request</h2>
          <p style="font-size: 15px; line-height: 1.5; color: #475569;">
            We received a request to reset your password for your Wadi Al Zaitoon account. Use the code below to reset your password:
          </p>
          <div style="background-color: #f1f5f9; border-radius: 6px; padding: 16px; text-align: center; margin: 24px 0; border: 1px dashed #cbd5e1;">
            <span style="font-size: 32px; font-weight: bold; font-family: monospace; letter-spacing: 6px; color: #0f172a;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #64748b;">
            This code is valid for <strong>10 minutes</strong>. For your security, do not share this code with anyone.
          </p>
          <p style="font-size: 13px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            If you did not request a password reset, please ignore this email or contact support if you have concerns.
          </p>
        </div>
        <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
          &copy; ${new Date().getFullYear()} Wadi Al Zaitoon Travels. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  return sendTransactionalEmail({ toEmail, subject, htmlContent });
};
