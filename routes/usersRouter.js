var express = require('express');
var router = express.Router();
var database = require('../database');
var encryptor = require('../encryptor');
var randomstring = require('randomstring');
var mailer = require('../mailer');

function isEmpty(value) {
  return value == '' || value == null || value == undefined;
}

function isEmailValid(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return !isEmpty(email) && re.test(String(email).toLowerCase());
}

function isFirstNameValid(name) {
  var re = /^[A-Za-z]+/;
  return !isEmpty(name) && re.test(name);
}

function isLastNameValid(name) {
  var re = /^[A-Za-z]+/;
  return !isEmpty(name) && re.test(name);
}

function isUsernameValid(username) {
  return !isEmpty(username) && !(/\s/.test(username));
}

function isPasswordValid(password) {
  return !isEmpty(password) && !(/\s/.test(password));
}

function isAddressValid(address) {
  return !isEmpty(address) && address.length < 300;
}

function isTokenValid(token) {
  return !isEmpty(token) && token.length == 64;
}

function isRequestValid(req) {
  return !isEmpty(req) && !isEmpty(req.body);
}

async function isUsernameAvailable(username) {
  var row = await database.manyOrNone('SELECT id FROM users WHERE username=$(username)', {
    username: username
  });
  return row.length == 0;
}

async function isEmailAvailable(email) {
  var row = await database.manyOrNone('SELECT id FROM users WHERE email=$(email)', {
    email: email
  });
  return row.length == 0;
}

router.get('/', function (req, res) {
  res.redirect('../');
})

router.post('/register', async function (req, res) {
  var result = {
    error: [],
    data: null
  };
  if (!isRequestValid(req)) result.error.push("invalidRequest");
  if (!isEmailValid(req.body.email)) result.error.push("invalidEmail");
  else if (!await isEmailAvailable(req.body.email)) result.error.push("emailTaken");
  if (!isUsernameValid(req.body.username)) result.error.push("invalidUsername");
  else if (!await isUsernameAvailable(req.body.username)) result.error.push("usernameTaken");
  if (!isPasswordValid(req.body.password)) result.error.push("invalidPassword");

  if (result.error.length == 0) {
    req.body.password = encryptor.cryptPassword(req.body.password);
    req.body.token = randomstring.generate(64);
    await database.none("INSERT INTO users(first_name, last_name, username, password, email, token) VALUES($(name.first), $(name.last), $(username), $(password), $(email), $(token))", req.body);
    result.data = {
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      token: req.body.token
    };
  }

  res.json(result);
});

router.post('/login', async function (req, res) {
  var result = {
    error: [],
    data: null
  };

  if (!isRequestValid(req)) result.error.push("invalidRequest");
  if (isEmailValid(req.body.username)) {
    req.body.email = req.body.username;
    req.body.username = null;
  } else if (!isUsernameValid(req.body.username)) result.error.push("invalidUsername");
  if (!isPasswordValid(req.body.password)) result.error.push("invalidPassword");

  if (result.error.length == 0) {
    var row = await database.oneOrNone('SELECT * FROM users WHERE ' + (!isEmpty(req.body.email) ? 'email=$(email)' : 'username=$(username)'), req.body);
    if (row) {
      if ((await database.one("SELECT has_too_many_failed_logins($(id))", row)).has_too_many_failed_logins) {
        result.error.push("tooManyFailedLogins");
        row.tmpPassword = randomstring.generate(10);
        mailer.generateEmail({
          username: row.username,
          name: row.first_name + " " + row.last_name,
          newPassword: row.tmpPassword,
          ipAddress: req.socket.remoteAddress,
          time: Date(Date.now()).toLocaleString()
        }, async (html, plaintext) => {
          mailer.sendEmail('account password reset', row.email, html, plaintext);
          row.tmpPassword=encryptor.cryptPassword(row.tmpPassword);
          await database.none("UPDATE users SET password=$(tmpPassword) WHERE id=$(id)", row);
          await database.one("SELECT reset_failed_logins($(id));", row);
        });
      } else {
        if (encryptor.comparePassword(req.body.password, row.password)) {
          var token = randomstring.generate(64);
          await database.none("UPDATE users SET token=$(token) WHERE id=$(id)", {
            token: token,
            id: row.id
          });
          result.data = {
            username: row.username,
            name: {
              first: row.first_name,
              last: row.last_name
            },
            token: token
          };
          await database.one("SELECT reset_failed_logins($(id));", row);
        } else {
          result.error.push("wrongPassword");
          await database.one("SELECT failed_login($(id));", row);
        }
      }
    } else {
      result.error.push("wrong" + (!isEmpty(req.body.email) ? "Email" : "Username"));
    }
  }
  res.json(result);
});

router.post('/logout', async function (req, res) {
  var result = {
    error: [],
    data: null
  };
  if (!isRequestValid(req)) result.error.push("invalidRequest");
  if (!isTokenValid(req.body.token)) result.error.push('invalidToken');

  if (result.error.length == 0) {
    var row = await database.oneOrNone("SELECT * FROM users WHERE token=$(token)", req.body);
    if (row) {
      await database.none("UPDATE users SET token=NULL WHERE id=$(id)", {
        id: row.id
      });
      result.data = {
        username: row.username,
        name: {
          first: row.first_name,
          last: row.last_name
        }
      };
    } else {
      result.error.push("wrongOrExpiredToken");
    }
  }
  res.json(result);
})

router.post('/read', async function (req, res) {
  var result = {
    error: [],
    data: null
  };
  if (!isRequestValid(req)) result.error.push("invalidRequest");
  if (!isTokenValid(req.body.token)) result.error.push('invalidToken');

  if (result.error.length == 0) {
    var row = await database.oneOrNone("SELECT * FROM users WHERE token=$(token)", req.body);
    if (row) {
      result.data = row;
      result.data.name = {
        first: row.first_name,
        last: row.last_name
      };
      delete result.data.first_name;
      delete result.data.last_name;
      delete result.data.id;
      delete result.data.password;
      delete result.data.failed_logins;
    } else {
      result.error.push("wrongOrExpiredToken");
    }
  }
  res.json(result);
});

router.post('/update', async function (req, res) {
  var result = {
    error: [],
    data: {}
  };
  if (!isRequestValid(req)) result.error.push("invalidRequest");
  if (!isTokenValid(req.body.token)) result.error.push('invalidToken');

  if (result.error.length == 0) {
    var row = await database.oneOrNone("SELECT id FROM users WHERE token=$(token)", req.body);
    if (!row) result.error.push("wrongOrExpiredToken");
    else {
      req.body.id = row.id;
      if (req.body.hasOwnProperty('username')) {
        if (!isUsernameValid(req.body.username)) result.error.push("invalidUsername");
        else if (!await isUsernameAvailable(req.body.username)) result.error.push("usernameTaken");
        else await database.none("UPDATE users SET username=$(username) WHERE id=$(id)", req.body);
      }
      if (req.body.hasOwnProperty('email')) {
        if (!isEmailValid(req.body.email)) result.error.push("invalidEmail");
        else if (!await isEmailAvailable(req.body.email)) result.error.push("emailTaken");
        else await database.none("UPDATE users SET email=$(email) WHERE id=$(id)", req.body);
      }
      if (req.body.hasOwnProperty('name')) {
        if (req.body.name.hasOwnProperty('first')) {
          if (!isFirstNameValid(req.body.name.first)) result.error.push('invalidFirstName');
          else await database.none("UPDATE users SET first_name=$(name.first) WHERE id=$(id)", req.body);
        }
        if (req.body.name.hasOwnProperty('last')) {
          if (!isLastNameValid(req.body.name.last)) result.error.push('invalidLastName');
          else await database.none("UPDATE users SET last_name=$(name.last) WHERE id=$(id)", req.body);
        }
      }
      if (req.body.hasOwnProperty('address')) {
        if (!isAddressValid(req.body.address)) result.error.push("invalidAddress");
        else await database.none("UPDATE users SET address=$(address) WHERE id=$(id)", req.body);
      }
      if (req.body.hasOwnProperty('password')) {
        if (!isPasswordValid(req.body.password)) result.error.push("invalidPassword");
        else {
          req.body.password = encryptor.cryptPassword(req.body.password);
          await database.none("UPDATE users SET password=$(password) WHERE id=$(id)", req.body);
          result.data.password = "passwordUpdated";
        }
      }
      if (req.body.hasOwnProperty('profile_picture')) {
        if (req.body.profile_picture.length >= 100000) result.error.push("profilePictureSizeTooLarge");
        else await database.none("UPDATE users SET profile_picture=$(profile_picture) WHERE id=$(id)", req.body);
      }
      delete req.body.id;
      result.data = req.body;
    }
  }
  res.json(result);
});

router.post('/purchase', async function (req, res) {
  var result = {
    error: [],
    data: {}
  };

  if (!isRequestValid(req)) result.error.push("invalidRequest");
  if (!isTokenValid(req.body.token)) result.error.push('invalidToken');
  if (req.body.amount < 1 || req.body.amount > 100) result.error.push('invalidAmount');
  if (result.error.length == 0) {
    var row = await database.oneOrNone("SELECT id FROM users WHERE token=$(token)", req.body);
    if (!row) result.error.push("wrongOrExpiredToken");
    else {
      req.body.id = row.id;
      req.body.time = Date.now();
      var available = await database.manyOrNone("SELECT address FROM storageunits WHERE owner_id=-1");
      if (available.length <= req.body.amount) result.error.push("tooLargeAmount");
      else {
        req.body.assigned = [];
        for (var i = 0; i < req.body.amount; i++) {
          req.body.assigned.push(available[Math.round(Math.random() * available.length)].address);
          req.body.last = req.body.assigned[req.body.assigned.length - 1];
          await database.none("UPDATE storageunits SET owner_id=$(id), time_purchased=$(time) WHERE address=$(last)", req.body);
        }
        result.data = {
          addresses: req.body.assigned,
          amount: req.body.amount
        }
      }
    }
  }
  res.json(result);
});

router.post('/forgot_password', async function (req, res) {
  var result = {
    error: [],
    data: {}
  };

  if (!isRequestValid(req)) result.error.push("invalidRequest");
  if (!isEmailValid(req.body.email)) result.error.push("invalidEmail");

  if (result.error.length == 0) {
    var row = await database.oneOrNone("SELECT * FROM users WHERE email=$(email)", req.body);
    if (!row) result.error.push("emailNotRecognised");
    else {
      row.tmpPassword = randomstring.generate(10);
      mailer.generateEmail({
        username: row.username,
        name: row.first_name + " " + row.last_name,
        newPassword: row.tmpPassword,
        ipAddress: req.socket.remoteAddress,
        time: Date(Date.now()).toLocaleString()
      }, async (html, plaintext) => {
        mailer.sendEmail('account password reset', row.email, html, plaintext);
        row.tmpPassword=encryptor.cryptPassword(row.tmpPassword);
        await database.none("UPDATE users SET password=$(tmpPassword) WHERE id=$(id)", row);
      });
    }
  }
  res.json(result);
});

module.exports = router;