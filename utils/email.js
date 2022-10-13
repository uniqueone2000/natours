// This variable brings in the 'nodemailer' npm package
const nodemailer = require('nodemailer');

// This variable brings in the 'pug' npm package
const pug = require('pug');

// This variable brings in the 'html-to-text' npm package
const htmlToText = require('html-to-text');

// This class is used for the email handler
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Charles Evelyn <${process.env.EMAIL_FROM}>`
  }

  newTransport() {
    // This is used to check whether we are in production mode
    if (process.env.NODE_ENV === 'production') {

      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }
    // This is if we are in development mode
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
   }

   // This is the 'SEND' method for the all the emails
   async send(template, subject){

     // 1) Render the HTML based on a pug template
     const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
       firstName: this.firstName,
       url: this.url,
       subject
     });

     // 2) This defines the email options
     const mailOptions = {
       from: this.from,
       to: this.to,
       subject,
       html,
       text: htmlToText.fromString(html)
     };

     // 3) Create a transport and send the emails
     await this.newTransport().sendMail(mailOptions);
   }

   // === START OF EMAIL FUNCTIONS OR TYPES OF EMAILS === //

   // This is the 'Welcome' email function
   async sendWelcome() {
     await this.send('welcome', 'Welcome to the Natours Family');
   }

   // This is the 'Password Reset' email function
   async sendPasswordReset() {
     await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)');
   }
};


// === END OF EMAIL FUNCTIONS OR TYPES OF EMAILS === //
