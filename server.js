const express = require('express');
const nodemailer = require('nodemailer');

const MY_EMAIL_PASSWORD = process.env.EMAIL_PASS;
const RECIPIENT_EMAIL = 'muhammadwaqarsikandar@gmail.com';

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

    const mailOptions = {
      from: '"Your Web Service" <ai@gg-projektbau.de>',
      to: RECIPIENT_EMAIL,
      subject: `New Submission from ${formData.first_name}`,
      html: `<h3>New Contact Form Submission</h3>
        <ul>
          <li><strong>Name:</strong> ${formData.first_name}</li>
          <li><strong>Email:</strong> ${formData.email}</li>
          <li><strong>Phone:</strong> ${formData.custom1}</li>
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
  // Use the exact built-in variable names from the request body
  const { first_name, email, custom1, address } = req.body;

  // Updated validation to use the exact variable names
  if (!first_name || !email || !custom1 || !address) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Pass the object with the exact names to the function
    await sendContactEmail({ first_name, email, custom1, address });
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

module.exports = app;