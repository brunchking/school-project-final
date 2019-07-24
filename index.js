const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const fs = require('fs');

// Router
const index1Router = require('./routes/index1');
const aboutusRouter = require('./routes/aboutus');
const chooseRouter = require('./routes/choose');
const mainPageRouter = require('./routes/atoz');
const pureRouter = require('./routes/pure');
const weatherRouter = require('./routes/weather');
const communityRouter = require('./routes/community');
const contactRouter = require('./routes/contact');
const usersRouter = require('./routes/users');
const a_Router = require('./routes/attractions/a');
const z_Router = require('./routes/attractions/z');
// Test
const testRouter = require('./routes/test');
const templateRouter = require('./routes/template');

const app = express();

// Passport config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to Mongo
mongoose
    .connect(
        db,
        { useNewUrlParser: true }
    )
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global Vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

// Static & view
app.use(express.static(path.join(__dirname, '/public')));
app.set('views', path.join(__dirname, './views/ejs'));


app.use('/', index1Router);
app.use('/atoz', mainPageRouter);
app.use('/aboutus', aboutusRouter);
app.use('/choose', chooseRouter);
app.use('/contact', contactRouter);
app.use('/pure', pureRouter);
app.use('/weather', weatherRouter);
app.use('/users', usersRouter);
app.use('/community', communityRouter);
app.use('/a', a_Router);
app.use('/z', z_Router);

// Test router
app.use('/test', testRouter);
app.use('/template', templateRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT);