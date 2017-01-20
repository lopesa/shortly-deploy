var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var Link = require('../app/config').Link;
// var User = require('../app/models/user');
// var Link = require('../app/models/link');
// var Users = require('../app/collections/users');
// var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.status(200).send(links.models);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;
  console.log('req.body ===>');
  console.log(req.body);

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  // var silence = new Kitten({ name: 'Silence' });



  

  Link.find({ url: uri }, function(err, links) {
    if (err) {
      return console.error(err);
    } else if (links.length === 1) {       // alredy have the link
      // handle already have link...

      console.log('we are in the ellse if');
      console.log('links', links[0]);
      res.status(200).send(links[0]);
    } else { // need to create the link
      console.log('we are in the else statement');
      
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.error(err);
          return res.sendStatus(404);
        }
        var newLink = new Link ({
          url: uri,
          baseUrl: uri.split('/').slice(0, 3).join('/') + '/',
          title: title,
          visits: 0
        });

        newLink.save(function (err, newLink) {
          if (err) {
            // return console.error(err);
            return res.sendStatus(404);
          } else {
            res.status(200).send(newLink);
          }
        });

      });
      

    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  new User({ username: username })
    .fetch()
    .then(function(user) {
      if (!user) {
        res.redirect('/login');
      } else {
        user.comparePassword(password, function(match) {
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        });
      }
    });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  new User({ username: username })
    .fetch()
    .then(function(user) {
      if (!user) {
        var newUser = new User({
          username: username,
          password: password
        });
        newUser.save()
          .then(function(newUser) {
            Users.add(newUser);
            util.createSession(req, res, newUser);
          });
      } else {
        console.log('Account already exists');
        res.redirect('/signup');
      }
    });
};

//FETCH THROWING ERROR
exports.navToLink = function(req, res) {
  // new Link({ code: req.params[0] }).fetch().then(function(link) {
  Link.find({ code: req.params[0] }, function(err, links) {
    console.log('links from navtolink', links);
    if (err) {
      return console.error(err);
    } else if (!link) {
      res.redirect('/');
    } else {
      link.set({ visits: link.get('visits') + 1 })
        .save()
        .then(function() {
          return res.redirect(link.get('url'));
        });
    }
  });
};