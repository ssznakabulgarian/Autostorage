var nodemailer = require('nodemailer');
var serverEmailUser = {
    user: 'mailer@autostorage.online',
    pass: '48N.GN)0GoK#'
};

module.exports.sendEmail = async function (subject, emails, html, content) {
    return new Promise((resolve, reject)=>{
        var transporter = nodemailer.createTransport({
            host: "mail.autostorage.online",
            port: 26,
            secure: false,
            auth: serverEmailUser,
            tls: {
                rejectUnauthorized: false
            }
        });

        transporter.sendMail({
            from: 'mailer@autostorage.online',
            to: emails,
            subject: subject,
            text: content,
            html: html
        }, function (err, res) {
            if (err) reject(err);
            else resolve(res);
        });
    });
}