const nodemailer = require("nodemailer");
require("dotenv").config();

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  try {
    // Validate that email credentials are configured
    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      console.warn("SMTP credentials not configured. Email will not be sent.");
      console.log("Reset token for", email, ":", resetToken);
      return false;
    }

    const transporter = createTransporter();

    // Email content
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: "Password Reset Request",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #007bff;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .button:hover {
              background-color: #0056b3;
            }
            .token {
              background-color: #f4f4f4;
              padding: 10px;
              border-radius: 3px;
              font-family: monospace;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Password Reset Request</h2>
            <p>Hello,</p>
            <p>You requested to reset your password. Click the button below to reset your password:</p>
            ${resetUrl ? `<a href="${resetUrl}?token=${resetToken}" class="button">Reset Password</a>` : ''}
            <p>Or copy and paste this token into the reset password form:</p>
            <div class="token">${resetToken}</div>
            <p><strong>This token will expire in 1 hour.</strong></p>
            <p>If you did not request this password reset, please ignore this email.</p>
            <p>Best regards,<br>Dev Tinder Team</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request
        
        You requested to reset your password. 
        
        Reset Token: ${resetToken}
        
        This token will expire in 1 hour.
        
        If you did not request this password reset, please ignore this email.
        
        Best regards,
        Dev Tinder Team
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    // Log the token as fallback
    console.log("Reset token for", email, ":", resetToken);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
};




