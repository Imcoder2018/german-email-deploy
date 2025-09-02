const express = require('express');
const nodemailer = require('nodemailer');

const MY_EMAIL_PASSWORD = process.env.EMAIL_PASS;
const RECIPIENT_EMAIL = 'your-fixed-email@yourdomain.com';

const app = express();
app.use(express.json());

async function sendContactEmail(formData) {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.ionos.de',
      port: 587,
      secure: false,
      auth: {
        user: 'ai@gg-projektbau.de',
        pass: MY_EMAIL_PASSWORD,
      },
    });

    // Construct the email with the new variables
    const mailOptions = {
      from: '"Your Web Service" <ai@gg-projektbau.de>',
      to: RECIPIENT_EMAIL,
      subject: `New Submission from ${formData.firstName} ${formData.lastName}`,
      html: `<h3>New Contact Form Submission</h3>
        <ul>
          <li><strong>First Name:</strong> ${formData.firstName}</li>
          <li><strong>Last Name:</strong> ${formData.lastName}</li>
          <li><strong>Email:</strong> ${formData.email}</li>
          <li><strong>Phone Number:</strong> ${formData.phone}</li>
          <li><strong>Company:</strong> ${formData.companyName}</li>
          <li><strong>Industry:</strong> ${formData.industry}</li>
          <li><strong>Address:</strong> ${formData.address}</li>
        </ul>`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Message sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email.');
  }
}

app.post('/webhook', async (req, res) => {
  // Extract the new variables from the request body
  const { firstName, lastName, email, phone, companyName, industry, address } = req.body;

  // Updated validation check
  if (!firstName || !lastName || !email || !phone || !companyName || !industry || !address) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await sendContactEmail({ firstName, lastName, email, phone, companyName, industry, address });
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

module.exports = app;