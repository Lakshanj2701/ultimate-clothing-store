const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'chathushka4321@gmail.com',
    pass: 'fyhe qrkd flip gcro',
  },
});

module.exports = transporter;