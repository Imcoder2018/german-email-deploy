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

    // This part of the code remains the same. It will dynamically build the
    // email body from the new, smaller "filteredData" object.
    let emailBodyHtml = '<h3>New Webhook Submission</h3>';
    
    if (Object.keys(formData).length === 0) {
      emailBodyHtml += '<p>This submission did not contain any data.</p>';
    } else {
      emailBodyHtml += '<ul>';
      for (const [key, value] of Object.entries(formData)) {
        if (typeof value === 'object' && value !== null) {
          emailBodyHtml += `<li><strong>${key}:</strong> <pre>${JSON.stringify(value, null, 2)}</pre></li>`;
        } else {
          emailBodyHtml += `<li><strong>${key}:</strong> ${value || 'Not provided'}</li>`;
        }
      }
      emailBodyHtml += '</ul>';
    }
    
    const subject = `New Call Submission: ${formData.call_id || ''}`;

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


// --- Define the Webhook Endpoint (UPDATED SECTION) ---
app.post('/webhook', async (req, res) => {
  console.log('Webhook received a request...');
  
  // --- The new filtering logic starts here ---
  const incomingData = req.body;
  const filteredData = {};

  // Define a "whitelist" of the keys you want to keep in the final email.
  const desiredKeys = ['call_id', 'from_number', 'to_number', 'args', 'transcript'];

  // Loop through the desired keys and copy them from the incoming data to our new object.
  for (const key of desiredKeys) {
    if (incomingData[key] !== undefined) {
      filteredData[key] = incomingData[key];
    }
  }
  // --- The filtering logic ends here ---

  try {
    // Pass the new, smaller "filteredData" object to the email function.
    await sendContactEmail(filteredData);
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