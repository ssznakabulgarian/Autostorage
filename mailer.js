var nodemailer = require('nodemailer');
var serverEmailUser = {
    user: 'mailer@quizbattle.net',
    pass: '8Dw2LJ2y!B,B'
};

module.exports.sendEmail = function (subject, emails, content) {
    var result = {
        success: false,
        error: null,
        data: null
    };
    var transporter = nodemailer.createTransport({
        host: "mail.quizbattle.net",
        port: 26,
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