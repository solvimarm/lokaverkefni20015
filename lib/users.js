'use strict';

var hash = require('../lib/pass').hash;
var pg = require('pg');

var DATABASE ='postgres://viktor:@localhost/lokaverkefni';

function createUserWithHashAndSalt (username, salt, hash, cb) {
  pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      return cb(error);
    }

    var values = [username, salt, hash, new Date()];
    var query = 'INSERT into users (username, salt, hash, date) VALUES($1, $2, $3, $4)';
    client.query(query, values, function (err, result) {
      done();

      if (err) {
        console.error(err);
        return cb(error);
      } else {
        return cb(null, true);
      }
    });
  });
}

module.exports.insertprofile =function insertprofile (username, cb) {
  pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      return cb(error);
    }

    var values = [username];
    var query = 'INSERT into profile (username) VALUES($1)';
    client.query(query, values, function (err, result) {
      done();

      if (err) {
        console.error(err);
        return cb(error);
      } else {
        return cb(null, true);
      }
    });
  });
}

function findUser (username, cb) {
  pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      return cb(error);
    }

    var values = [username];
    var query = 'SELECT username, salt, hash FROM users WHERE username = $1';
    client.query(query, values, function (err, result) {
      done();

      if (err) {
        return cb(error);
      } else {
        return cb(null, result.rows);
      }
    });
  });
}

module.exports.createUser = function createUser (username, password, cb) {
  hash(password, function (err, salt, hash) {
    if (err) {
      return cb(err);
    }

    createUserWithHashAndSalt(username, salt, hash, cb);
  });
};

module.exports.listUsers = function listUsers (username, cb) {
  console.log(cb);
  pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      return cb(error);
    }

    var values = [username];
    var query = 'SELECT username FROM users WHERE username LIKE $1';
    client.query(query, values, function (err, result) {
      done();

      if (err) {
        return cb(error);
      } else {
        return cb(null, result.rows);
      }
    });
  });
};

module.exports.auth = function auth (name, pass, fn) {
  findUser(name, function (err, result) {
    var user = null;

    if (result.length === 1) {
      user = result[0];
    }

    if (!user) {
      return fn(new Error('cannot find user'));
    }

    hash(pass, user.salt, function(err, hash){
      if (err) {
        return fn(err);
      }
      
      if (hash === user.hash) {
        return fn(null, user);
      }

      fn(new Error('invalid password'));
    });
  });
}

module.exports.findprofile = function findprofile (username, cb) {
  pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      return cb(error);
    }

    var values = [username];
    var query = 'SELECT * FROM profile WHERE username = $1';
    client.query(query, values, function (err, result) {
      done();

      if (err) {
        return cb(error);
      } else {
        return cb(null, result.rows);
      }
    });
  });
}

module.exports.updateprofile =function updateprofile (username, about, image, phone, email, rank, contry,cb) {
  pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      return cb(error);
    }

    var values = [username, about, image, phone, email, rank, contry];
    var query = 'UPDATE profile SET email=$5, about=$2, image=$3, phonenumber=$4,rank=$6, country=$7 WHERE username=$1';
    client.query(query, values, function (err, result) {
      done();

      if (err) {
        console.error(err);
        return cb(error);
      } else {
        return cb(null, true);
      }
    });
  });
}

