var nodemailer = require('nodemailer');
var fs = require('fs');
var HTMLparser = require('node-html-parser');
var serverEmailUser = {
    user: '',
    pass: ''
};

module.exports.sendEmail = function (subject, recipients, html, content) {
    return new Promise((resolve, reject) => {
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
            from: 'Autostorage <mailer@autostorage.online>',
            to: recipients,
            subject: subject,
            text: content,
            html: html
        }, function (err, res) {
            if (err) reject(err);
            else resolve(res);
        });
    });
}
module.exports.generateEmail = function (data, callback /**/ ) {
    fs.readFile("./public/email.html", (error, html) => {
        if (error) throw error;
        else {
            html = HTMLparser.parse(html);
            console.log(data);
            html.querySelector('#name-field').set_content('Hello, '+data.name+', ');
            html.querySelector('#username-field').set_content('username: '+data.username);
            html.querySelector('#new-password-field').set_content('new password: '+data.newPassword);
            html.querySelector('#ip-address-field').set_content('IP address: '+data.ipAddress);
            html.querySelector('#time-field').set_content('time: '+data.time);
            callback(html.toString(), html.querySelector("#body").text);
        }
    });
}
