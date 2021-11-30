/*
   Copyright 2016, Google, Inc.
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
       http://www.apache.org/licenses/LICENSE-2.0
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

/* Require shared configuration variables, eg. our Google Project ID */
var config = require('./config');

/* Require "books" service for querying, creating, and deleting books */
var books = require('./books')(config);

/* Require "auth" service for authenticating users and getting profile info */
var auth = require('./auth')(config);

/* Require Express web framework and Express middleware */
var express = require('express');
var multer = require('multer')
var session = require('cookie-session');

/* Configure Express web application */
var app = express();
app.use(express.static('public'));
app.set('view engine', 'jade');
app.enable('trust proxy');
app.use(multer({ inMemory: true }));
app.use(session({ signed: true, secret: config.cookieSecret }));

/* Fetch all books and display them */
app.get('/', function(req, res, next) {
  books.getAllBooks(function(err, books, key) {
    if (err) return next(err);
    var keyBooks = books.map((book) => Object.assign(book, { id: book.id || book[key].id }));
    res.render('index', { books: keyBooks, user: req.session.user });
  });
});

/* Fetch books created by the currently logged in user and display them */
app.get('/mine', function(req, res, next) {
  if (! req.session.user) return res.redirect('/');
  books.getUserBooks(req.session.user.id, function(err, books, key) {
    if (err) return next(err);
    var keyBooks = books.map((book) => Object.assign(book, { id: book.id || book[key].id }));
    res.render('index', { books: keyBooks, user: req.session.user });
  });
});

/* Redirect user to OAuth 2.0 login URL */
app.get('/login', function(req, res) {
  var authenticationUrl = auth.getAuthenticationUrl();
  res.redirect(authenticationUrl);
});

/* Use OAuth 2.0 authorization code to fetch user's profile */
app.get('/oauth2callback', function(req, res, next) {
  auth.getUser(req.query.code, function(err, user) {
    if (err) return next(err);
    req.session.user = user;
    res.redirect('/');
  });
});

/* Clear the session */
app.get('/logout', function(req, res) {
  req.session = null;
  res.redirect('/');
});

/* Add a new book */
app.post('/books', function(req, res, next) {
  if (! req.body.title || ! req.body.author)
    return next(new Error('Must provide book Title and Author'));

  var coverImageData;
  if (req.files['cover'])
    coverImageData = req.files['cover'].buffer;

  var userId;
  if (req.session.user)
    userId = req.session.user.id;

  books.addBook(req.body.title, req.body.author, coverImageData, userId, function(err) {
    if (err) return next(err);
    res.redirect(req.get('Referer') || '/');
  })
});

/* Delete book by key */
app.get('/books/delete', function(req, res, next) {
  books.deleteBook(req.query.id, function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
});

app.get('/_ah/health', function(req, res) {
  res.type('text').send('ok');
});

/* Run web application */
app.listen(8080);

console.log('Running on http://localhost:8080/');
