const nodemailer = require("nodemailer");
let errormsg, success;

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: "smtp.mail.yahoo.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to send an invitation email
const sendInvitation = (toEmail, inviteeName) => {
  const defaultMessageHtml = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Hello,</h2>
                    <p>You have been invited by <strong>${inviteeName}</strong> to join our chat platform.</p>
                    <p>Connect with friends, share updates, and enjoy seamless conversations.</p>
                    <p>Please click the link below to sign up and start chatting:</p>
                    <a href="https://your-signup-link.com" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Sign Up Now</a>
                    <p style="margin-top: 20px;">Best regards,<br>Your Company</p>
            </div>
    `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Invitation for a Chat",
    html: defaultMessageHtml,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      errormsg = error;
    } else {
      console.log("Email sent:", info.response);
      success = info.response;
    }
  });

  if (errormsg) return errormsg;

  if (success) return success;
};

module.exports = { sendInvitation };
