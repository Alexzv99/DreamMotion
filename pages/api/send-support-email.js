import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    // Configure Zoho SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_USER, // e.g. 'support@dreammotion.com'
        pass: process.env.ZOHO_PASS  // your Zoho app password
      }
    });

    await transporter.sendMail({
      from: '"DreamMotion Support" <support@dreammotion.online>',
      to: 'support@dreammotion.online',
      subject: 'New Support Message from DreamMotion Contact Page',
      text: message
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
