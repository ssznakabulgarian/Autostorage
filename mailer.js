var nodemailer = require('nodemailer');
var serverEmailUser = {
    user: 'easy-store@gmail.com',
    pass: '#1a4u7t8o9s5t6o2r3e@9a8u7t4o5s6t3o2r1e!'
};

module.exports.sendEmail = function (subject, emails, content) {
    var result = {
        success: false,
        error: null,
        data: null
    };
    var transporter = nodemailer.createTransport({
        host: "smtp.gmail.host",
        port: 587,
        secure: true, // use TLS
        auth: serverEmailUser
      });
    var mailOptions = {
        from: serverEmailUser.user,
        to: emails,
        subject: subject,
        html: content,
        replyTo: serverEmailUser.user
    };
    transporter.sendMail(mailOptions, function (err, res) {
        if (err) {
            result.error = err;
        } else {
            result.success = true;
            result.data = res;
        }
        return result;
    });
    return false;
}