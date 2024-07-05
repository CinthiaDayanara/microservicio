require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

app.post('/notify', async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    await transporter.sendMail({
      from: '"Task Manager" <noreply@taskmanager.com>',
      to,
      subject,
      text
    });
    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Notification service running on port ${PORT}`));