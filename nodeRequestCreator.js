var request = require('request');
module.exports.createRequest: (url, data, callback) => {
        var options = {
            url: url,
            body: data,
            json: true,
            method: 'post'
        }
        request(options, callback);
    }