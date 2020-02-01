var crypto = require('crypto');

module.exports.cryptPassword = function (password) {
  return crypto.createHash('sha256').update(password).digest('hex');
};

module.exports.comparePassword = function (plainPass, hashWord) {
  return hashWord == crypto.createHash('sha256').update(plainPass).digest('hex');
};