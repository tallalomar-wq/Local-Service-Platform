import nodemailer from 'nodemailer';

const createTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || 'development';
  
  if (emailService === 'development') {
    // For local testing with Mailtrap
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'sandbox.smtp.mailtrap.io',
      port: parseInt(process.env.EMAIL_PORT || '2525'),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else if (emailService === 'gmail') {
    // For Gmail SMTP
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password
      },
    });
  } else {
    // For SendGrid, Mailgun, etc.
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
};

export const sendVerificationEmail = async (
  to: string,
  verificationToken: string,
  firstName: string
): Promise<void> => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
  
  // In development mode without email credentials, just log the verification link
  if (process.env.EMAIL_SERVICE === 'development' && !process.env.EMAIL_USER) {
    console.log('\n📧 EMAIL VERIFICATION LINK (DEV MODE)');
    console.log(`Email: ${to}`);
    console.log(`Name: ${firstName}`);
    console.log(`Link: ${verificationUrl}`);
    console.log('─────────────────────────────────────\n');
    return;
  }

  const transporter = createTransporter();
  const mailOptions = {
    from: `"ServiceHub" <${process.env.EMAIL_FROM || 'noreply@servicehub.com'}>`,
    to,
    subject: 'Verify Your ServiceHub Account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ServiceHub!</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>Thank you for registering with ServiceHub. To complete your registration, please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; color: #4F46E5;">${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account with ServiceHub, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 ServiceHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${to}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    // In development mode, log the verification link even if email fails
    if (process.env.NODE_ENV === 'development') {
      console.log('\n📧 EMAIL FAILED - SHOWING LINK (DEV MODE)');
      console.log(`Email: ${to}`);
      console.log(`Name: ${firstName}`);
      console.log(`Link: ${verificationUrl}`);
      console.log('─────────────────────────────────────\n');
      return; // Don't throw error in development
    }
    throw new Error('Failed to send verification email');
  }
};

export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string,
  firstName: string
): Promise<void> => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"ServiceHub" <${process.env.EMAIL_FROM || 'noreply@servicehub.com'}>`,
    to,
    subject: 'Reset Your ServiceHub Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 30px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>You requested to reset your password. Click the button below to reset it:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
              <p>This link will expire in 1 hour.</p>
              <p>If you didn't request a password reset, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 ServiceHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${to}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};
