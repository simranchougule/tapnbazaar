import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Cloudinary-hosted icon — works in all email clients including Gmail
const LOGO_URL = "https://res.cloudinary.com/dy17bhpex/image/upload/v1782130264/tapnbazaar-square-icon.png"

function emailWrapper(body: string): string {
  const frontendUrl = process.env.FRONTEND_URL || ''
  const parts: string[] = [
    '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>',
    '<meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>',
    '<body style="margin:0;padding:0;background:#f4f4f4;font-family:Segoe UI,Arial,sans-serif;">',
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">',
    '<tr><td align="center">',
    '<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">',
    '<tr><td align="center" style="background:#ffffff;border-radius:16px 16px 0 0;padding:28px 40px 18px;border-bottom:2px solid #f97316;">',
    '<img src="' + LOGO_URL + '" alt="TapnBazaar" width="80" height="80" style="display:block;margin:0 auto;border-radius:16px;" />',
    '</td></tr>',
    '<tr><td style="background:#ffffff;padding:32px 40px 36px;">',
    body,
    '</td></tr>',
    '<tr><td style="background:#fafafa;border-radius:0 0 16px 16px;border-top:1px solid #f0f0f0;padding:18px 40px;text-align:center;">',
    '<span style="font-size:13px;font-weight:700;color:#f97316;">TapnBazaar</span><br/>',
    '<span style="font-size:10px;color:#ccc;">You received this because you have a TapnBazaar account. | <a href="' + frontendUrl + '" style="color:#ccc;">tapnbazaar.com</a></span>',
    '</td></tr>',
    '</table></td></tr></table></body></html>',
  ]
  return parts.join('')
}

export const sendEmailVerification = async (email: string, token: string): Promise<void> => {
  const verifyUrl = (process.env.FRONTEND_URL || '') + '/verify-email?token=' + token
  const body = [
    '<h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111;">Verify your email ✉️</h2>',
    '<p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">Welcome to TapnBazaar! Click the button below to confirm your email address and activate your account.</p>',
    '<a href="' + verifyUrl + '" style="display:inline-block;background:#f97316;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">✅ Verify Email</a>',
    '<p style="margin:28px 0 0;font-size:12px;color:#aaa;line-height:1.6;">This link expires in <strong>24 hours</strong>.<br/>If you did not create a TapnBazaar account, you can safely ignore this email.</p>',
  ].join('')
  await transporter.sendMail({
    from:    '"TapnBazaar" <' + process.env.SMTP_USER + '>',
    to:      email,
    subject: 'Verify your TapnBazaar email',
    html:    emailWrapper(body),
  })
}

export const sendSmsOtp = async (phone: string, otp: string): Promise<boolean> => {
  const apiKey = process.env.FAST2SMS_API_KEY
  if (!apiKey) { console.error('[SMS] FAST2SMS_API_KEY not set'); return false }
  try {
    // route=v3 uses a predefined OTP template — works on free Fast2SMS accounts
    // variables_values sends YOUR otp into the template variable
    const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'v3',
        sender_id: 'FTSMS',
        message: '163935',
        variables_values: otp,
        flash: 0,
        numbers: phone,
      }),
    })
    const data = await res.json() as { return?: boolean; message?: string[] }
    console.log('[SMS] Fast2SMS response:', JSON.stringify(data))
    if (data.return === true) return true

    // v3 failed — try otp route as fallback
    const res2 = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: otp,
        flash: 0,
        numbers: phone,
      }),
    })
    const data2 = await res2.json() as { return?: boolean; message?: string[] }
    console.log('[SMS] Fast2SMS otp route response:', JSON.stringify(data2))
    return data2.return === true
  } catch (err) {
    console.error('[SMS] Fast2SMS error:', err)
    return false
  }
}

export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
  const body = [
    '<h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111;">Phone Verification OTP</h2>',
    '<p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.6;">Use the one-time password below to verify your mobile number on TapnBazaar.</p>',
    '<div style="background:#fff8f3;border:2px dashed #f97316;border-radius:12px;padding:20px;text-align:center;margin-bottom:20px;">',
    '<p style="margin:0 0 4px;font-size:12px;color:#f97316;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Your OTP</p>',
    '<p style="margin:0;font-size:40px;font-weight:800;letter-spacing:12px;color:#111;">' + otp + '</p>',
    '</div>',
    '<p style="margin:0;font-size:12px;color:#aaa;line-height:1.6;">Expires in <strong>10 minutes</strong>. Do not share this with anyone.<br/>TapnBazaar will never ask for your OTP over the phone or chat.</p>',
  ].join('')
  await transporter.sendMail({
    from:    '"TapnBazaar" <' + process.env.SMTP_USER + '>',
    to:      email,
    subject: 'Your TapnBazaar OTP',
    html:    emailWrapper(body),
  })
}

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  const resetUrl = (process.env.FRONTEND_URL || '') + '/reset-password?token=' + token
  const body = [
    '<h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111;">Reset your password</h2>',
    '<p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">We received a request to reset the password for your TapnBazaar account. Click the button below to set a new password.</p>',
    '<a href="' + resetUrl + '" style="display:inline-block;background:#f97316;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">Reset Password</a>',
    '<p style="margin:28px 0 0;font-size:12px;color:#aaa;line-height:1.6;">This link expires in <strong>1 hour</strong>.<br/>If you did not request a password reset, you can safely ignore this email. Your account is secure and no changes have been made.</p>',
  ].join('')
  await transporter.sendMail({
    from:    '"TapnBazaar" <' + process.env.SMTP_USER + '>',
    to:      email,
    subject: 'Reset your TapnBazaar password',
    html:    emailWrapper(body),
  })
}