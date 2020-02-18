var express = require('express');
var router = express.Router();
var database = require('../database');
var encryptor = require('../encryptor');
var randomstring = require('randomstring');

function isEmpty(value) {
  return value == '' || value == null || value == undefined;
}

function isEmailValid(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return !isEmpty(email) && re.test(String(email).toLowerCase());
}

function isNameValid(name) {
  var re = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/;
  return !isEmpty(name) && re.test(name);
}

function isUsernameValid(username) {
  return !isEmpty(username) && !(/\s/.test(username));
}

function isPasswordValid(password) {
  return !isEmpty(password) && !(/\s/.test(password));
}

function isTokenValid(token) {
  return !isEmpty(token) && token.length==64;
}

function isRequestValid(req) {
  return !isEmpty(req) && !isEmpty(req.body);
}

async function isUsernameAvailable(req) {
  var row = await database.manyOrNone('SELECT id FROM users WHERE username=$(username)', req.body);
  return row.length == 0;
}

async function isEmailAvaliable(req) {
  var row = await database.manyOrNone('SELECT id FROM users WHERE email=$(email)', req.body);
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
  if (!isUsernameValid(req.body.username)) result.error.push("invalidUsername");
  if (!isPasswordValid(req.body.password)) result.error.push("invalidPassword");
  if (!await isUsernameAvailable(req)) result.error.push("usernameTaken");
  if (!await isEmailAvaliable(req)) result.error.push("emailTaken");

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
})
router.post('/login', async function (req, res) {
  var result = {
    error: [],
    data: null
  };

  if (!isRequestValid(req)) result.error.push("invalidRequest");
  if (isEmailValid(req.body.username)) {
    req.body.email = req.body.username;
    req.body.username = null;
  }else if (!isUsernameValid(req.body.username)) result.error.push("invalidUsername");
  if (!isPasswordValid(req.body.password)) result.error.push("invalidPassword");

  if (result.error.length == 0) {
    var row = await database.oneOrNone('SELECT * FROM users WHERE ' + (!isEmpty(req.body.email) ? 'email=$(email)' : 'username=$(username)'), req.body);
    if (row) {
      if ((await database.one("SELECT has_too_many_failed_logins($(id))", row)).has_too_many_failed_logins) {
        result.error.push("tooManyFailedLogins");
        //send reset password email
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
          //res.redirect('../dashboard.html');
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
})

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
      delete result.data.id;
      delete result.data.password;
      delete result.data.failed_logins;
    } else {
      result.error.push("wrongOrExpiredToken");
    }
  }
  res.json(result);
})

router.post('/update', async function (req, res) {
  var result = {
    error: [],
    data: {}
  };
  if (!isRequestValid(req)) result.error.push("invalidRequest");
  if (!isTokenValid(req.body.token)) result.error.push('invalidToken');
  if (!isEmpty(req.body.username) && !isUsernameAvailable(req.body.username)) result.error.push("usernameTaken");
  if (!isEmpty(req.body.username) && !isUsernameValid(req.body.username)) result.error.push("invalidUsername");
  if (!isEmpty(req.body.email) && !isEmailAvailable(req.body.email)) result.error.push("emailTaken");
  if (!isEmpty(req.body.email) && !isEmailValid(req.body.email)) result.error.push("invalidEmail");
  if (!isEmpty(req.body.age) && (typeof (req.body.age) != "number" || req.body.age > 120 || req.body.age < 5)) result.error.push("invalidAge");
  if (!isEmpty(req.body.name.first) && !isEmpty(req.body.name.last) && !isNameValid(req.body.name.first + ' ' + req.body.name.last)) result.error.push("invalidName");
  if (!isEmpty(req.body.password) && !isPasswordValid(req.body.password)) result.error.push("invalidPassword");

  result.data = req.body;
  if (result.error.length == 0) {
    if (!isEmpty(req.body.username)) {
      await database.none("UPDATE users SET username=$(useranme) WHERE token=$token", req.body);
    }
    if (!isEmpty(req.body.email)) {
      await database.none("UPDATE users SET email=$(email) WHERE token=$token", req.body);
    }
    if (!isEmpty(req.body.age)) {
      await database.none("UPDATE users SET age=$(age) WHERE token=$token", req.body);
    }
    if (!isEmpty(req.body.name.first) && !isEmpty(req.body.name.last)) {
      await database.none("UPDATE users SET first_name=$(name.first) last_name=$(name.last) WHERE token=$token", req.body);
    }
    if (!isEmpty(req.body.password)) {
      req.body.password = encryptor.cryptPassword(req.body.password);
      await database.none("UPDATE users SET password=$(password)", req.body);
      result.data.password = "passwordUpdated";
    }
  }
  res.json(result);
})

module.exports = router;