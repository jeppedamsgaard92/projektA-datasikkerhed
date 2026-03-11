//til email
require("dotenv").config();
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true fordi vi bruger port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendLoginMail(to, verifyLink) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Dit login-link",
    text: `Klik på linket for at logge ind: ${verifyLink}`,
    html: `<p>Klik på linket for at logge ind:</p><p><a href="${verifyLink}">${verifyLink}</a></p>`,
  });
}

module.exports = {
  sendLoginMail,
};