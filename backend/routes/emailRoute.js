const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

router.post('/send', async (req, res) => {
  try {
    const { fullName, email, phone, message } = req.body;
    
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: "siyat211@gmail.com",
      subject: `New Contact Form Message from ${fullName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong> ${message}</p>
      `
    });

    res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

module.exports = router;
