import nodemailer from 'nodemailer'
import { env } from '../../config/env'
import { logger } from './logger'

<<<<<<< HEAD
// Create transporter lazily so bad credentials don't crash at startup
let _transporter: ReturnType<typeof nodemailer.createTransport> | null = null
let _transporterChecked = false

const getTransporter = () => {
  if (_transporterChecked) return _transporter
  _transporterChecked = true

  if (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD ||
      env.GMAIL_USER === 'your_gmail@gmail.com' ||
      env.GMAIL_APP_PASSWORD === 'your_16_char_app_password') {
    logger.warn('⚠️  Gmail credentials not configured — emails will be logged to console only')
    return null
  }

  _transporter = nodemailer.createTransport({
=======
const createTransporter = () => {
  if (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD) {
    logger.warn('⚠️  Gmail credentials not set — emails will be logged to console only')
    return null
  }

  return nodemailer.createTransport({
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
    service: 'gmail',
    auth: {
      user: env.GMAIL_USER,
      pass: env.GMAIL_APP_PASSWORD,
    },
  })
<<<<<<< HEAD
  return _transporter
}

=======
}

const transporter = createTransporter()

>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
<<<<<<< HEAD
  const transporter = getTransporter()

  if (!transporter) {
    logger.info(`📧 [DEV EMAIL — not sent] To: ${options.to} | Subject: ${options.subject}`)
=======
  const mailOptions = {
    from: `"${env.EMAIL_FROM_NAME}" <${env.GMAIL_USER || env.EMAIL_FROM_ADDRESS}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  }

  if (!transporter) {
    logger.info('📧 [DEV EMAIL - not sent]', {
      to: options.to,
      subject: options.subject,
    })
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
    return
  }

  try {
<<<<<<< HEAD
    await transporter.sendMail({
      from: `"${env.EMAIL_FROM_NAME}" <${env.GMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })
    logger.info(`📧 Email sent to ${options.to}`)
  } catch (error) {
    // Log the error but NEVER throw — email failure should never break API responses
    logger.error('Email send failed (non-fatal):', (error as Error).message)
=======
    await transporter.sendMail(mailOptions)
    logger.info(`📧 Email sent to ${options.to}`)
  } catch (error) {
    logger.error('Email send failed:', error)
    throw new Error('Failed to send email')
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
  }
}

export const sendOTPEmail = async (email: string, otp: string, name: string): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Reset your NexaBid password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
<<<<<<< HEAD
=======
                  <!-- Header -->
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
                  <tr>
                    <td style="background:#0A0A0A;padding:32px;text-align:center;">
                      <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">NexaBid</span>
                    </td>
                  </tr>
<<<<<<< HEAD
=======
                  <!-- Body -->
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
                  <tr>
                    <td style="padding:40px 32px;">
                      <p style="margin:0 0 8px;font-size:24px;font-weight:600;color:#0A0A0A;letter-spacing:-0.5px;">
                        Reset your password
                      </p>
                      <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6;">
                        Hi ${name}, here is your one-time password to reset your NexaBid account password.
                      </p>
<<<<<<< HEAD
=======
                      <!-- OTP Box -->
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
                      <div style="background:#f4f4f5;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
                        <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;">Your OTP code</p>
                        <p style="margin:0;font-size:40px;font-weight:700;letter-spacing:8px;color:#0A0A0A;">${otp}</p>
                      </div>
                      <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;text-align:center;">
                        This code expires in <strong>${env.OTP_EXPIRES_MINUTES} minutes</strong>
                      </p>
                      <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
                        If you didn't request this, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
<<<<<<< HEAD
=======
                  <!-- Footer -->
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
                  <tr>
                    <td style="padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center;">
                      <p style="margin:0;font-size:12px;color:#d1d5db;">© 2024 NexaBid. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  })
}

export const sendWelcomeEmail = async (email: string, name: string, role: string): Promise<void> => {
  await sendEmail({
    to: email,
    subject: `Welcome to NexaBid${role === 'manufacturer' ? ' — Manufacturer Portal' : ''}`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background:#0A0A0A;padding:32px;text-align:center;">
                      <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">NexaBid</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px 32px;">
                      <p style="margin:0 0 8px;font-size:24px;font-weight:600;color:#0A0A0A;letter-spacing:-0.5px;">
                        Welcome, ${name}! 🎉
                      </p>
                      <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
                        Your NexaBid ${role === 'manufacturer' ? 'manufacturer' : 'client'} account has been created successfully.
                        ${role === 'manufacturer'
                          ? 'You can now browse orders and start accepting manufacturing jobs.'
                          : 'You can now post orders and find manufacturers.'}
                      </p>
                      <a href="${role === 'manufacturer' ? env.MANUFACTURER_URL : env.CLIENT_URL}"
                        style="display:inline-block;background:#0A0A0A;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:600;">
                        Go to Dashboard →
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center;">
                      <p style="margin:0;font-size:12px;color:#d1d5db;">© 2024 NexaBid. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  })
}
