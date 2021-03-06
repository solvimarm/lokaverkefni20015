'use strict';

var express = require('express');
var router = express.Router();
var validate = require('../lib/validate');
var users = require('../lib/users');
var post = require('../lib/anotherbrickinthewall');

router.get('/restricted', ensureLoggedinIn, index);
router.post('/restricted',tagOnTheWallHandler);
router.get('/login', redirectIfLoggedIn, login);
router.post('/login', loginHandler);
router.get('/logout', logout);
router.get('/create', createForm);
router.post('/create', addprofile, createHandler);
router.get('/newpost', ensureLoggedinIn, newPost);
router.post('/newpost',tagOnTheWallHandler);
router.get('/addcomment/:post_id', ensureLoggedinIn, newComment);
router.post('/addcomment/:post_id', AddCommentHandler);
router.get('/userprofile/:username', ensureLoggedinIn, userProfile);
router.get('/members', ensureLoggedinIn, allMembers);
router.post('/members',searchMember);
router.get('/myprofile', ensureLoggedinIn, myProfile);
router.get('/edit', ensureLoggedinIn, editProfile);
router.post('/edit', postEdit);



module.exports = router;

/** route middlewares **/

function createForm(req, res, next) {
  res.render('create', { title: 'Create user' });
}

function addprofile(req, res, next){
  var username = req.body.username;
  console.log(username);
  users.insertprofile(username, function (err, status) {
    if (err) {
      console.error(err);
    }


    var success = true;

    if (err || !status) {
      success = false;
    }
  });
  next();
}

function createHandler(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  // hér vantar *alla* villumeðhöndlun
  if(validate.isName(username) && validate.isName(password)){
    users.createUser(username, password, function (err, status) {
      if (err) {
        console.error(err);
      }

      var success = true;

      if (err || !status) {
        success = false;
      }

      res.render('create', { title: 'Create user', post: true, success: success });
    });
  }
  else{
    res.render('create', { title: 'Create user', fault: true });
  }
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
    res.render('restricted', { title: 'Restricted zone',
      user: user,
      entries: entryList
    });
  });
}


function tagOnTheWallHandler(req, res, next){
  var text = req.body.textarea;
  var user = req.session.user;
  var newurl = req.body.url;
  var headline = req.body.headline;
  var vid = req.body.video;
  if(validate.isEmpty(headline)){
    post.createPost (user.username, text, headline, newurl, vid,function (err, status) {
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
  else{
    res.render('newpost', { title: 'new post', fault: true });
  }
}

function newPost(req, res, next) {
  var user = req.session.user;
  res.render('newpost', { title: 'newpost',
    user:user
   });
}

function AddCommentHandler(req, res, next){
  var comment = req.body.comment;
  var user = req.session.user;
  var col_id = req.params.post_id;
  post.addComment (user.username, comment, col_id, function (err, status) {
    if (err) {
      console.error(err);
    }

    var success = true;

    if (err || !status) {
      success = false;
    }
    res.redirect('/addcomment/'+ col_id);
  });
}

function newComment(req, res, next) {
  var user = req.session.user;
  var id = req.params.post_id;
  post.postC(id, function (err, entryList) {
    post.listComments(id, function (err, all) {
      console.log(entryList);
      res.render('addcomment', { title: 'new comments',
        user: user,
        comm: all,
        entries: entryList
      });
    });
  });

}

function userProfile(req, res, next) {
  var user = req.session.user;
  var usname = req.params.username;
  post.finduserpost(usname, function (err, all){
    users.findprofile(usname, function (err, entryList) {
      console.log(entryList);
      console.log(all);
      res.render('userprofile', { title: 'not your profile',
        user: user,
        posted: all,
        entries: entryList
      });
    });
  });
}

function myProfile(req, res, next) {
  var user = req.session.user;
  var usname = req.session.user.username;
  post.finduserpost(usname, function (err, all){
    users.findprofile(usname, function (err, entryList) {
      console.log(entryList);
      console.log(all);
      res.render('myprofile', { title: 'myprofile',
        user: user,
        posted: all,
        entries: entryList
      });
    });
  });
}

function allMembers(req, res, next) {
  var user = req.session.user;
  users.listUsers(function (err, result) {
    res.render('members', { title: 'members',
      user: user,
      users:result
    });
  });
}

function searchMember(req, res, next) {
  var user = req.session.user;
  var usname = req.body.search;
  console.log(user);
  users.listUsers(function (err, result) {
    users.searchUsers(usname, function (err, entryList) {
      res.render('members', { title: 'members',
        user: user,
        users: result,
        find: entryList
      });
    });
  });
}

function editProfile (req, res, next){
  var user = req.session.user;
  var usname = req.session.user.username;
  console.log(user);
  users.findprofile(usname, function (err, entryList) {
    res.render('edit', { title: 'edit your profile',
      user: user,
      entries: entryList
    });
  });
}

function postEdit (req, res, next){
  var about = req.body.about;
  var user = req.session.user;
  var image = req.body.image_url;
  var phone = req.body.phonenumber;
  var email = req.body.email;
  var rank = req.body.selectrank;
  var land = req.body.contry;
  console.log(rank);
  users.updateprofile(user.username, about, image, phone, email, rank, land,function (err, status) {
    if (err) {
      console.error(err);
    }

    var success = true;

    if (err || !status) {
      success = false;
    }
    res.redirect('/myprofile');
  });
}


