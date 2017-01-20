// var path = require('path');
// var knex = require('knex')({
//   client: 'sqlite3',
//   connection: {
//     filename: path.join(__dirname, '../db/shortly.sqlite')
//   },
//   useNullAsDefault: true
// });
// var db = require('bookshelf')(knex);

// db.knex.schema.hasTable('urls').then(function(exists) {
//   if (!exists) {
//     db.knex.schema.createTable('urls', function (link) {
//       link.increments('id').primary();
//       link.string('url', 255);
//       link.string('baseUrl', 255);
//       link.string('code', 100);
//       link.string('title', 255);
//       link.integer('visits');
//       link.timestamps();
//     }).then(function (table) {
//       console.log('Created Table', table);
//     });
//   }
// });

// db.knex.schema.hasTable('users').then(function(exists) {
//   if (!exists) {
//     db.knex.schema.createTable('users', function (user) {
//       user.increments('id').primary();
//       user.string('username', 100).unique();
//       user.string('password', 100);
//       user.timestamps();
//     }).then(function (table) {
//       console.log('Created Table', table);
//     });
//   }
// });

// module.exports = db;
var crypto = require('crypto');


var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/shortly');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
//   // we're connected!
//   console.log('listening on 27017');
  
//   // if exists... (?)


db.userSchema = new mongoose.Schema({
  username: String,
  password: String
});

db.linkSchema = new mongoose.Schema({
  url: String,
  baseUrl: String,
  code: String,
  title: String,
  visits: Number
  // plus method for increasing visits? Or handle that elsewhere?
});


db.linkSchema.pre('save', function(next) {
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  var shaCode = shasum.digest('hex').slice(0, 5);

  this.code = shaCode;  
  next();
});



// db.userSchema.pre('save', function(next) {
//   this.hashPassword();

//   next();

// });

var User = mongoose.model('User', db.userSchema);
var Link = mongoose.model('Link', db.linkSchema);

User.hashPassword = function(unencryptedPassword) {
  var cipher = Promise.promisify(bcrypt.hash);

  cipher(unencryptedPassword).then(function(hash) {
    this.password = hash;
  });

  // next();
  

  // return cipher(this.get('password'), null, null).bind(this)
  //   .then(function(hash) {

    // });

};




module.exports = {
  db: db,
  User: User,
  Link: Link
};








