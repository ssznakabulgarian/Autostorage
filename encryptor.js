var bcrypt = require('bcrypt');

module.exports.cryptPassword = async function (password) {
  return await bcrypt.hash(password, await bcrypt.genSalt(10));
};

module.exports.comparePassword = async function (plainPass, hashword) {
  return await bcrypt.compare(plainPass, hashword);
};