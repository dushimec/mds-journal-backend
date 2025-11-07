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

// Submission Status Update Email Template
export const submissionStatusEmailTemplate = (
  status: string,
  manuscriptTitle: string,
  link?: string
) => `
<div style="font-family: Arial, sans-serif; background-color: #f0f7ff; padding: 40px;">
  <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <div style="background-color: #1d4ed8; padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">African Journal</h1>
      <p style="color: #dbeafe; margin: 4px 0 0 0; font-size: 14px;">Submission Status Update</p>
    </div>
    <div style="padding: 24px; color: #1f2937;">
      <p style="font-size: 16px;">Hello,</p>
      <p style="font-size: 16px;">The status of your submission <strong>"${manuscriptTitle}"</strong> has been updated to <strong style="color: #1d4ed8;">${status}</strong>.</p>
      <p style="font-size: 14px; color: #6b7280;">You can view the submission details${link ? ` <a href="${link}" style="color: #1d4ed8;">here</a>` : " in your account"}.</p>

      ${status === 'PUBLISHED' ? `
        <div style="margin-top: 16px; padding: 16px; background-color: #ecfdf5; border-radius: 8px; color: #065f46;">
          <strong>Good news!</strong> Your manuscript has been published. Congratulations!
        </div>
      ` : ''}

      ${status === 'REJECTED' ? `
        <div style="margin-top: 16px; padding: 16px; background-color: #fff1f2; border-radius: 8px; color: #9f1239;">
          We're sorry to inform you that your submission was not accepted. Thank you for submitting to African Journal.
        </div>
      ` : ''}

      ${status === 'UNDER_REVIEW' ? `
        <div style="margin-top: 16px; padding: 16px; background-color: #f0f7ff; border-radius: 8px; color: #1d4ed8;">
          Your submission is now under review. We'll notify you with updates as they become available.
        </div>
      ` : ''}

      <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">If you have questions, reply to this email or contact the editorial office.</p>
    </div>
    <div style="background-color: #f0f7ff; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">&copy; ${new Date().getFullYear()} African Journal. All rights reserved.</div>
  </div>
</div>
`;
