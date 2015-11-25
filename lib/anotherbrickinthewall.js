'use strict';

var pg = require('pg');

var DATABASE = 'postgres://postgres:tb9fmDVg@localhost/verkefni6';

module.exports.createPost=function createPost (username, text, headline, newurl, video,cb) {
  pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      return cb(error);
    }

    var values = [username, text, headline, newurl, video,new Date()];
    var query = 'INSERT into posts (username, text, headline, url, embed,date) VALUES($1, $2, $3, $4, $5, $6)';
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


module.exports.addComment=function addComment (username, comment, col_id, cb) {
  pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      return cb(error);
    }

    var values = [username, comment, col_id,new Date()];
    var query = 'INSERT into comments (username, comment, col_id, date) VALUES($1, $2, $3, $4)';
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

module.exports.listComments = function listComments (id, cb) {
  pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      return cb(error);
    }

    var values = [id];
    var query = 'SELECT * FROM comments WHERE col_id=$1 order by date DESC';
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

module.exports.postC = function postC (id, cb) {
  pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      return cb(error);
    }

    var values = [id];
    var query = 'SELECT headline, text, username, date, url, embed FROM posts WHERE post_id=$1';
    client.query(query, values,function (err, result) {
      done();

      if (err) {
        return cb(error);
      } else {
        return cb(null, result.rows);
      }
    });
  });
};

module.exports.finduserpost = function finduserpost (username, cb) {
  pg.connect(DATABASE, function (error, client, done) {
    if (error) {
      return cb(error);
    }

    var values = [username];
    var query = 'SELECT headline, date, post_id FROM posts WHERE username=$1';
    client.query(query, values,function (err, result) {
      done();

      if (err) {
        return cb(error);
      } else {
        return cb(null, result.rows);
      }
    });
  });
};
