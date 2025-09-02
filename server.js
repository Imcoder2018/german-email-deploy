// Import necessary libraries
const express = require('express');
const nodemailer = require('nodemailer');

// --- Load environment variables ---
const MY_EMAIL_PASSWORD = process.env.EMAIL_PASS;
const RECIPIENT_EMAIL = 'muhammadwaqarsikandar@gmail.com'; // Your recipient email

// --- Create the Express App ---
const app = express();
app.use(express.json()); // Middleware to parse incoming JSON data

/**
 * Sends an email with dynamically generated content based on the formData.
 * @param {object} formData - An object containing any key-value pairs from the request.
 */
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

    // --- Dynamically build the email body ---
    let emailBodyHtml = '<h3>New Webhook Submission</h3>';
    
    // Check if any data was sent
    if (Object.keys(formData).length === 0) {
      emailBodyHtml += '<p>This submission did not contain any data.</p>';
    } else {
      emailBodyHtml += '<ul>';
      // Loop through all key-value pairs in the received data and add them to a list
      for (const [key, value] of Object.entries(formData)) {
        emailBodyHtml += `<li><strong>${key}:</strong> ${value || 'Not provided'}</li>`;
      }
      emailBodyHtml += '</ul>';
    }

    // --- Create a dynamic subject line ---
    // It will use a name if available, otherwise it uses a generic title.
    const subjectName = formData.first_name || formData.name || 'Anonymous';
    const subject = `New Submission from ${subjectName}`;

    // --- Construct the email options ---
    const mailOptions = {
      from: '"Your Web Service" <ai@gg-projektbau.de>',
      to: RECIPIENT_EMAIL,
      subject: subject,
      html: emailBodyHtml,
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
  
  // 1. Get ALL data from the request body, no matter what it is
  const formData = req.body;

  // 2. The validation check for required fields has been REMOVED.

  try {
    // 3. Call the email function with whatever data was received
    await sendContactEmail(formData);
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