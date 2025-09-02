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

    // --- Dynamically build the email body (UPDATED SECTION) ---
    let emailBodyHtml = '<h3>New Webhook Submission</h3>';
    
    if (Object.keys(formData).length === 0) {
      emailBodyHtml += '<p>This submission did not contain any data.</p>';
    } else {
      emailBodyHtml += '<ul>';
      for (const [key, value] of Object.entries(formData)) {
        // Check if the value is an object. If so, format it as a JSON string.
        if (typeof value === 'object' && value !== null) {
          // JSON.stringify converts the object to text. The '<pre>' tag preserves formatting.
          emailBodyHtml += `<li><strong>${key}:</strong> <pre>${JSON.stringify(value, null, 2)}</pre></li>`;
        } else {
          // If it's not an object, display it normally.
          emailBodyHtml += `<li><strong>${key}:</strong> ${value || 'Not provided'}</li>`;
        }
      }
      emailBodyHtml += '</ul>';
    }
    
    // --- Create a dynamic subject line ---
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
  const formData = req.body;

  try {
    await sendContactEmail(formData);
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Failed to process webhook:', error);
    res.status(500).json({ message: 'Internal Server Error. Could not send email.' });
  }
});


// --- Start the Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running and listening on port ${PORT}`);
});