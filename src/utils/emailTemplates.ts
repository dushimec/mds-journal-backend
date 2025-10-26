// utils/emailTemplates.ts

// Password Reset Email Template
export const passwordResetEmailTemplate = (resetUrl: string) => `
<div style="font-family: Arial, sans-serif; background-color: #f0f7ff; padding: 40px;">
  <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <div style="background-color: #1d4ed8; padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">African Journal</h1>
      <p style="color: #dbeafe; margin: 4px 0 0 0; font-size: 14px;">Your gateway to research & collaboration</p>
    </div>
    <div style="padding: 24px; color: #1f2937;">
      <p style="font-size: 16px;">Hi,</p>
      <p style="font-size: 16px;">You requested to reset your password. Click the button below to set a new password. This link is valid for 10 minutes.</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${resetUrl}" style="background-color: #1d4ed8; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-size: 16px; display: inline-block;">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link into your browser:<br>
        <a href="${resetUrl}" style="color: #1d4ed8; word-break: break-all;">${resetUrl}</a>
      </p>
      <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">If you did not request a password reset, please ignore this email.</p>
    </div>
    <div style="background-color: #f0f7ff; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">&copy; ${new Date().getFullYear()} African Journal. All rights reserved.</div>
  </div>
</div>
`;

// Two-Factor Authentication Email Template
export const twoFactorEmailTemplate = (code: string) => `
<div style="font-family: Arial, sans-serif; background-color: #f0f7ff; padding: 40px;">
  <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <div style="background-color: #1d4ed8; padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">African Journal</h1>
      <p style="color: #dbeafe; margin: 4px 0 0 0; font-size: 14px;">Two-Factor Authentication Code</p>
    </div>
    <div style="padding: 24px; color: #1f2937; text-align: center;">
      <p style="font-size: 16px;">Your 2FA code is:</p>
      <p style="font-size: 28px; font-weight: bold; color: #1d4ed8; margin: 16px 0;">${code}</p>
      <p style="font-size: 14px; color: #6b7280;">This code is valid for 10 minutes.</p>
    </div>
    <div style="background-color: #f0f7ff; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">&copy; ${new Date().getFullYear()} African Journal. All rights reserved.</div>
  </div>
</div>
`;

// Email Verification Template
export const emailVerificationTemplate = (code: string) => `
<div style="font-family: Arial, sans-serif; background-color: #f0f7ff; padding: 40px;">
  <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <div style="background-color: #1d4ed8; padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">African Journal</h1>
      <p style="color: #dbeafe; margin: 4px 0 0 0; font-size: 14px;">Verify Your Email</p>
    </div>
    <div style="padding: 24px; color: #1f2937; text-align: center;">
      <p style="font-size: 16px;">Your email verification code is:</p>
      <p style="font-size: 28px; font-weight: bold; color: #1d4ed8; margin: 16px 0;">${code}</p>
      <p style="font-size: 14px; color: #6b7280;">This code is valid for 1 hour.</p>
    </div>
    <div style="background-color: #f0f7ff; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">&copy; ${new Date().getFullYear()} African Journal. All rights reserved.</div>
  </div>
</div>
`;

// Generic HTML Email Template
export const genericEmailTemplate = (subject: string, content: string) => `
<div style="font-family: Arial, sans-serif; background-color: #f0f7ff; padding: 40px;">
  <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <div style="background-color: #1d4ed8; padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">African Journal</h1>
      <p style="color: #dbeafe; margin: 4px 0 0 0; font-size: 14px;">${subject}</p>
    </div>
    <div style="padding: 24px; color: #1f2937;">${content}</div>
    <div style="background-color: #f0f7ff; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">&copy; ${new Date().getFullYear()} African Journal. All rights reserved.</div>
  </div>
</div>
`;
