// Import necessary libraries
const express = require('express');
const nodemailer = require('nodemailer');

// --- IMPORTANT: Load environment variables for security ---
// For local testing, you might need a package like `dotenv` (`npm install dotenv`)
// For deployment, you will set these in your hosting service's dashboard.
const MY_EMAIL_PASSWORD = process.env.EMAIL_PASS;
const RECIPIENT_EMAIL = 'muhammadwaqarsikandar@gmail.com'; // The email address that will receive the form data

// --- Create the Express App ---
const app = express();
app.use(express.json()); // Middleware to parse incoming JSON data

/**
 * This is your existing email function, slightly modified.
 * It's now more generic and gets all its data passed in.
 */
async function sendContactEmail(formData) {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.ionos.de',
      port: 587,
      secure: false,
      auth: {
        user: 'ai@gg-projektbau.de',
        pass: MY_EMAIL_PASSWORD, // Use the environment variable
      },
    });

    // Construct the email content from the form data
    const mailOptions = {
      from: '"Your Web Service" <ai@gg-projektbau.de>',
      to: RECIPIENT_EMAIL, // Send to your fixed email address
      subject: `New Contact Form Submission from ${formData.first_first_name}`,
      text: `You have a new submission:
        
        first_name: ${formData.first_first_name}
        Email: ${formData.email}
        custom1: ${formData.custom1}
        Address: ${formData.address}`,
      html: `<h3>New Contact Form Submission</h3>
        <ul>
          <li><strong>first_name:</strong> ${formData.first_first_name}</li>
          <li><strong>Email:</strong> ${formData.email}</li>
          <li><strong>custom1:</strong> ${formData.custom1}</li>
          <li><strong>Address:</strong> ${formData.address}</li>
        </ul>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent successfully! Message ID:', info.messageId);
    return info.messageId;

  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email.');
  }
}


// --- Define the Webhook Endpoint ---
app.post('/webhook', async (req, res) => {
  console.log('Webhook received a request...');
  
  // 1. Extract data from the request body
  const { first_name, email, custom1, address } = req.body;

  // 2. Basic Validation: Check if required fields are present
  if (!first_name || !email || !custom1 || !address) {
    return res.status(400).json({ message: 'Missing required fields: first_name, email, custom1, address' });
  }

  try {
    // 3. Call the email function with the extracted data
    await sendContactEmail({ first_name, email, custom1, address });
    // 4. Send a success response
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    // 5. Send an error response if something goes wrong
    console.error('Failed to process webhook:', error);
    res.status(500).json({ message: 'Internal Server Error. Could not send email.' });
  }
});


// --- Start the Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running and listening on port ${PORT}`);
});