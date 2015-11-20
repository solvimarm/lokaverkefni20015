'use strict';

var pg = require('pg');

var DATABASE = 'postgres://viktor:@localhost/lokaverkefni';

module.exports.createPost=function createPost (username, text, cb) {
  pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      return cb(error);
    }

    var values = [username, text, new Date()];
    var query = 'INSERT into posts (username, text, date) VALUES($1, $2, $3)';
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



module.exports.listPosts = function listPosts (cb) {
  pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      return cb(error);
    }

    var query = 'SELECT * FROM posts order by date DESC LIMIT 20';
    client.query(query, function (err, result) {
      done();

      if (err) {
        return cb(error);
      } else {
        return cb(null, result.rows);
      }
    });
  });
};

