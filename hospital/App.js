const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const expressValidator = require('express-validator');
const passport = require('passport');
var {mongoose} = require('./server/db/mongoose.js');

const { engine } = require("express-handlebars");
const _ = require('lodash');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const LocalStrategy = require('passport-local').Strategy;
const mongo = require('mongodb');

/*
    View Engine
*/
var app = express();
app.use(express.static(__dirname + '/views'));
app.use(express.static(path.join(__dirname, '/public')));
app.engine("handlebars", engine({ defaultLayout: "layout" }));
app.set('view engine', 'handlebars');

/*
    Bodyparser Middleware + Express session
*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
// session -> keep the user loggin after he login in on the website
//         -> creates an object req.session, where you can add properties
//         -> (ex: req.session.page_views, to count how many times he entered on the page)
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

/*
     Validator to validate data incoming with the re object to the server
*/
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

/*
    Flash to pop-up mesages in the browser
*/
app.use(flash());
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

/*
    Ensure authetification
*/
app.use('/app', (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/');
    }
});

/*
    Website routes
*/
var login = require('./routes/login');
var users = require('./routes/users');
var appRoute = require('./routes/app');
var patients = require('./routes/patients');
var settings = require('./routes/settings');
var diseases = require('./routes/diseases');
var rooms = require('./routes/rooms');

app.use('/', login);
app.use('/', appRoute);
app.use('/', users);
app.use('/', patients);
app.use('/', settings);
app.use('/', diseases);
app.use('/', rooms);

var timestamp = new Date().getTime();

app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), function() {
	console.log('Server started on port '+ app.get('port'));
});
