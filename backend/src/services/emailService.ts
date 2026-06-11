import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
})

export const sendEmailVerification = async (email: string, token: string) => {
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`
  await transporter.sendMail({
    from:    `"TapnBazaar" <${process.env.SMTP_USER}>`,
    to:      email,
    subject: 'Verify your TapnBazaar email',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border-radius:12px;border:1px solid #f0f0f0">
        <h2 style="color:#f97316;margin-bottom:8px">Verify your email</h2>
        <p style="color:#555;margin-bottom:24px">Click below to verify your TapnBazaar account.</p>
        <a href="${url}" style="display:inline-block;background:#f97316;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">Verify Email</a>
        <p style="color:#aaa;font-size:12px;margin-top:24px">Link expires in 24 hours. If you didn't sign up, ignore this.</p>
      </div>`,
  })
}

export const sendOtpEmail = async (email: string, otp: string) => {
  await transporter.sendMail({
    from:    `"TapnBazaar" <${process.env.SMTP_USER}>`,
    to:      email,
    subject: 'Your TapnBazaar OTP',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border-radius:12px;border:1px solid #f0f0f0">
        <h2 style="color:#f97316;margin-bottom:8px">Phone Verification OTP</h2>
        <p style="color:#555;margin-bottom:16px">Your one-time password is:</p>
        <div style="font-size:36px;font-weight:700;letter-spacing:8px;color:#111;margin:16px 0">${otp}</div>
        <p style="color:#aaa;font-size:12px;margin-top:24px">Expires in 10 minutes. Do not share this with anyone.</p>
      </div>`,
  })
}
