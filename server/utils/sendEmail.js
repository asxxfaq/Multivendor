// utils/sendEmail.js
import nodemailer from 'nodemailer'

export const sendEmail = async ({ to, subject, html }) => {
  // Debug — log what values are loaded
  console.log('EMAIL_USER:', process.env.EMAIL_USER)
  console.log('EMAIL_PASS set:', !!process.env.EMAIL_PASS)

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER or EMAIL_PASS is missing from .env')
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  // Verify connection before sending
  await transporter.verify()

  await transporter.sendMail({
    from: `"MultiShop" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  })

  console.log(`Email sent to ${to}`)
}