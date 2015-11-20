'use strict';

var express = require('express');
var router = express.Router();

var users = require('../lib/users');
var post = require('../lib/anotherbrickinthewall');

router.get('/restricted', ensureLoggedinIn, index);
router.post('/restricted',tagOnTheWallHandler);
router.get('/login', redirectIfLoggedIn, login);
router.post('/login', loginHandler);
router.get('/logout', logout);
router.get('/create', createForm);
router.post('/create', createHandler);
router.get('/newpost', ensureLoggedinIn, newPost);
router.post('/newpost',tagOnTheWallHandler);

module.exports = router;

/** route middlewares **/

function createForm(req, res, next) {
  res.render('create', { title: 'Create user' });
}

function createHandler(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  // hér vantar *alla* villumeðhöndlun
  users.createUser(username, password, function (err, status) {
    if (err) {
      console.error(err);
    }

    var success = true;

    if (err || !status) {
      success = false;
    }

    res.render('create', { title: 'Create user', post: true, success: success })
  });
}

function ensureLoggedinIn(req, res, next) {
  if (req.session.user) {
    next(); // köllum í næsta middleware ef við höfum notanda
  } else {
    res.redirect('/login');
  }
}

function redirectIfLoggedIn(req, res, next) {
  if (req.session.user) {
    res.redirect('/restricted');
  } else {
    next();
  }
}

function login(req, res, next) {
  res.render('login', { title: 'Login' });
}

function loginHandler(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  users.auth(username, password, function (err, user) {
    if (user) {
      req.session.regenerate(function (){
        req.session.user = user;
        res.redirect('/restricted');
      });
    } else {
      var data = {
        title: 'Login',
        username: username,
        error: true
      };
      res.render('login', data);
    }
  });
}

function logout(req, res, next) {
  // eyðir session og öllum gögnum, verður til nýtt við næsta request
  req.session.destroy(function(){
    res.redirect('/');
  });
}

function index(req, res, next) {
  var user = req.session.user;

  post.listPosts(function (err, entryList) {
    users.listUsers(function (err, all) {
      res.render('restricted', { title: 'Restricted zone',
        user: user,
        users: all,
        entries: entryList
      });
    });
  });
}
/*
function index(req, res, next) {
  var user = req.session.user;
  post.listPosts(function(err, entrylists){
  users.listUsers(function (err, all) {
    console.log(all)
    res.render('restricted', { title: 'Restricted zone',
      user: user,
      users: all,
      entries: entrylists
      console.log(entrylists);
       });
  });
  });
}
*/

function tagOnTheWallHandler(req, res, next){
  var text = req.body.textarea;
  var user = req.session.user;
  post.createPost (user.username, text, function (err, status) {
    if (err) {
      console.error(err);
    }

    var success = true;

    if (err || !status) {
      success = false;
    }
    index(req, res, next);
    res.redirect('/restricted');
  });
}

function newPost(req, res, next) {
  var user = req.session.user;
  res.render('newpost', { title: 'newpost',
    user:user
   });

}
