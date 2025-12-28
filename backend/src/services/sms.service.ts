import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: twilio.Twilio | null = null;

const initTwilioClient = () => {
  if (accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken);
  }
};

export const sendVerificationSMS = async (
  to: string,
  verificationCode: string
): Promise<void> => {
  // For development without Twilio, log to console
  if (!accountSid || !authToken || process.env.SMS_MODE === 'development') {
    console.log('─────────────────────────────────────');
    console.log('📱 SMS VERIFICATION CODE (DEV MODE)');
    console.log(`Phone: ${to}`);
    console.log(`Code: ${verificationCode}`);
    console.log('─────────────────────────────────────');
    return;
  }

  if (!twilioClient) {
    initTwilioClient();
  }

  if (!twilioClient) {
    throw new Error('Twilio is not configured');
  }

  try {
    await twilioClient.messages.create({
      body: `Your ServiceHub verification code is: ${verificationCode}. This code will expire in 10 minutes.`,
      from: fromNumber,
      to: to,
    });
    console.log(`Verification SMS sent to ${to}`);
  } catch (error) {
    console.error('Error sending verification SMS:', error);
    // In development, log code even if SMS fails
    if (process.env.NODE_ENV === 'development') {
      console.log('─────────────────────────────────────');
      console.log('📱 SMS FAILED - SHOWING CODE (DEV MODE)');
      console.log(`Phone: ${to}`);
      console.log(`Code: ${verificationCode}`);
      console.log('─────────────────────────────────────');
      return;
    }
    throw new Error('Failed to send verification SMS');
  }
};

export const sendBookingNotification = async (
  to: string,
  message: string
): Promise<void> => {
  // For development without Twilio, log to console
  if (!accountSid || !authToken || process.env.SMS_MODE === 'development') {
    console.log('─────────────────────────────────────');
    console.log('📱 SMS NOTIFICATION (DEV MODE)');
    console.log(`Phone: ${to}`);
    console.log(`Message: ${message}`);
    console.log('─────────────────────────────────────');
    return;
  }

  if (!twilioClient) {
    initTwilioClient();
  }

  if (!twilioClient) {
    throw new Error('Twilio is not configured');
  }

  try {
    await twilioClient.messages.create({
      body: message,
      from: fromNumber,
      to: to,
    });
    console.log(`Notification SMS sent to ${to}`);
  } catch (error) {
    console.error('Error sending notification SMS:', error);
    // Don't throw error for notifications, just log it
    console.log('SMS notification failed but continuing...');
  }
};

export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
