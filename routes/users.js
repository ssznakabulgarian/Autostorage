var express = require('express');
var router = express.Router();
var database = require('../database');
var encryptor = require('../encryptor');
var randomstring = require('randomstring');

function isEmailValid(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function isNameValid(name) {
  var re = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/;
  return re.test(name);
}

function isUsernameValid(name) {
  return !(/\s/.test(name));
}

function isPasswordValid(pass){
  return !(/\s/.test(pass));
}

function isEmpty(value) {
  return value == '' || value == null || value == undefined;
}

function isRequestValid(req, actionType) {
  if (isEmpty(req.body)) return false;
  switch (actionType) {
    case 'login':
      return !isEmpty(req.body.username) && !isEmpty(req.body.password);
    case 'register':
      return !isEmpty(req.body.name.first) && !isEmpty(req.body.name.last) && !isEmpty(req.body.username) && !isEmpty(req.body.email) && !isEmpty(req.body.age) && !isEmpty(req.body.password);
    case 'logout':
      return !isEmpty(req.body.token);
    case 'read':
      return !isEmpty(req.body.token);
    case 'update':
      return !isEmpty(req.body.token);
    default:
      return false;
  }
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
  console.log('error: no action specified');
  console.log('redirecting...');
  res.redirect('../');
})

router.post('/register', async function (req, res) {
  var result = {
    error: [],
    data: null
  };
  if (!isRequestValid(req, 'register')) result.error.push("invalidRequest");
  if (!isEmailValid(req.body.email)) result.error.push("invalidEmail");
  if (!isUsernameValid(req.body.username)) result.error.push("invalidUsername");
  if (!isPasswordValid(req.body.password)) result.error.push("invalidPassword");
  if (!await isUsernameAvailable(req)) result.error.push("usernameTaken");
  if (!await isEmailAvaliable(req)) result.error.push("emailTaken");

  if (result.error.length == 0) {
    req.body.password = await encryptor.cryptPassword(req.body.password);
    await database.none("INSERT INTO users(first_name, last_name, username, password, email, age) VALUES($(name.first), $(name.last), $(username), $(password), $(email), $(age))", req.body);
    result.data = ({
      name: req.body.name,
      username: req.body.username,
      email: req.body.email
    });
  }

  res.json(result);
})
router.post('/login', async function (req, res) {
  var result = {
    error: [],
    data: null
  };

  if (!isRequestValid(req, 'login')) result.error.push("invalidRequest");
  if (isEmailValid(req.body.username)) {
    req.body.email = req.body.username;
    req.body.username = null;
  } else if (!isEmpty(req.body.email) && !isEmailValid(req.body.email)) {
    result.error.push("invalidEmail");
  }
  if (!isEmpty(req.body.username)  && !isUsernameValid(req.body.username)) result.error.push("invalidUsername");
  if (!isPasswordValid(req.body.password)) result.error.push("invalidPassword");

  if (result.error.length == 0) {
    var row = await database.oneOrNone('SELECT * FROM users WHERE ' + (!isEmpty(req.body.email) ? 'email=$(email)' : 'username=$(username)'), req.body);
    if (row) {
      if ((await database.one("SELECT has_too_many_failed_logins($(id))", row)).has_too_many_failed_logins) {
        result.error.push("tooManyFailedLogins");
      } else {
        if (await encryptor.comparePassword(req.body.password, row.password)) {
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
      result.error.push("wrongUsernameOrEmail");
    }
  }

  res.json(result);
})

router.post('/logout', async function (req, res) {
  var result = {
    error: [],
    data: null
  };
  if (!isRequestValid(req, 'logout')) result.error.push("invalidRequest");
  
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
      result.error.push("invalidToken");
    }
  }
  res.json(result);
})

router.post('/read', async function (req, res) {
  var result = {
    error: [],
    data: null
  };
  if (!isRequestValid(req, 'read')) result.error.push("invalidRequest");

  if (result.error.length == 0) {
    var row = await database.oneOrNone("SELECT * FROM users WHERE token=$(token)", req.body);
    if(row){
      result.data = row;
      delete result.data.password;
      delete result.data.failed_logins;
    }else{
      result.error.push("invalidToken");
    }
  }
  res.json(result);
})

router.post('/update', async function (req, res) {
  var result = {
    error: [],
    data: {
      name: {first, last},
      username,
      email,
      password,
      age
    }
  };
  if (!isRequestValid(req, 'update')) result.error.push("invalidRequest");
  if (!isEmpty(req.body.username) && !isUsernameAvailable(req.body.username)) result.error.push("usernameTaken");
  if (!isEmpty(req.body.username)  && !isUsernameValid(req.body.username)) result.error.push("invalidUsername");
  if (!isEmpty(req.body.email) && !isEmailAvailable(req.body.email)) result.error.push("emailTaken");
  if (!isEmpty(req.body.email) && !isEmailValid(req.body.email)) result.error.push("invalidEmail");
  if (!isEmpty(req.body.age) && (typeof(req.body.age)!="number" || req.body.age>120 || req.body.age<3)) result.error.push("invalidAge"); 
  if (!isEmpty(req.body.name.first) && !isEmpty(req.body.name.last) && !isNameValid(req.body.name.first + ' ' + req.body.name.last)) result.error.push("invalidName");
  if (!isEmpty(req.body.password) && !isPasswordValid(req.body.password)) result.error.push("invalidPassword");

  if (result.error.length == 0) {
    if(!isEmpty(req.body.username)){
      await database.none("UPDATE users SET username=$(useranme) WHERE token=$token", req.body);
      result.data.username = req.body.username;
    }
    if(!isEmpty(req.body.email)){
      await database.none("UPDATE users SET email=$(email) WHERE token=$token", req.body);
      result.data.email = req.body.email;
    }
    if(!isEmpty(req.body.age)){
      await database.none("UPDATE users SET age=$(age) WHERE token=$token", req.body);
      result.data.age = req.body.age;
    }
    if(!isEmpty(req.body.name.first) && !isEmpty(req.body.name.last)){
      await database.none("UPDATE users SET first_name=$(name.first) last_name=$(name.last) WHERE token=$token", req.body);
      result.data.name = req.body.name;
    }
    if(!isEmpty(req.body.password)){
      req.body.password = await encryptor.cryptPassword(req.body.password);
      await database.none("UPDATE users SET password=$(password)", req.body);
      result.data.password="passwordUpdated";
    }
  }
  res.json(result);
})

module.exports = router;