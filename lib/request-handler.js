var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var Link = require('../app/config').Link;
var User = require('../app/config').User;
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

  Link.find({ url: uri }, function(err, links) {
    if (err) {
      return console.error(err);
    } else if (links.length === 1) {   // alredy have the link
      res.status(200).send(links[0]);
    } else { // need to create the link
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

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find( { username: username }, function(err, user) {
    if (err) {
      return console.error(err);
    } else if (user.length >= 1) {
      res.status(302).send(user[0]);
    } else {
      util.encryptPassword(password, function(err, encryptedPassword) {

        var newUser = new User ({
          username: username,
          password: encryptedPassword
        });

        newUser.save(function (err, newUser) {
          if (err) {
            // return console.error(err);
            return res.sendStatus(404);
          } else {
            res.redirect('/');
          }
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var unencryptedPassword = req.body.password;

  User.findOne( { username: username }, function(err, user) {
    if (!user) {
      res.redirect('/login');
    } else {
      var encryptedPassword = user.password;

      util.comparePassword(unencryptedPassword, encryptedPassword, function(match) {
        if (match) {
          util.createSession(req, res, user);
        } else {
          res.redirect('/');
        }
      });


      // user.comparePassword(unencryptedPassword, function(match) {
      //   if (match) {
      //     util.createSession(req, res, user);
      //   } else {
      //     res.redirect('/login');
      //   }
      // });
    }




  });



  // OLD CODE

  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       res.redirect('/login');
  //     } else {
  //       user.comparePassword(password, function(match) {
  //         if (match) {
  //           util.createSession(req, res, user);
  //         } else {
  //           res.redirect('/login');
  //         }
  //       });
  //     }
  //   });
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