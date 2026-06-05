const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const passport = require('passport');


let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let albumRouter = require('./routes/albums');
let tracksRouter = require('./routes/tracks');
let notificationsRouter = require('./routes/notifications');
let ticketsRouter = require('./routes/tickets');
let withdrawalsRouter = require('./routes/withdrawals');
let adminRouter = require('./routes/admin');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'gracie', cookie: {maxAge: 600000}, resave: false, saveUninitialized: false })); // Increase session maxAge to 10 minutes (600000ms) from 6000ms
app.use(passport.initialize());
require('./config/passport');

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/albums', albumRouter);
app.use('/tracks', tracksRouter);
app.use('/notifications', notificationsRouter);
app.use('/tickets', ticketsRouter);
app.use('/withdrawals', withdrawalsRouter);
app.use('/admin', adminRouter);

module.exports = app;
