const express = require('express');
const session = require('express-session');
const passport = require('passport');
require('./src/auth');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const Handlebars = require("hbs");
Handlebars.registerPartials(__dirname + "/views/partials/", (error) => { if (error) throw error });
app.set("view engine", "hbs");

app.use(express.static(__dirname + "/public"));

function isLoggedIn(req, res, next) {
    req.user ? next() : res.redirect('/');
}

app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/auth',
    passport.authenticate('google', { scope: ['email', 'profile'] }
    ));

app.get('/auth/callback',
    passport.authenticate('google', {
        successRedirect: '/calendar',
        failureRedirect: '/'
    })
);

app.get('/calendar', isLoggedIn, (req, res) => {
    //res.send(`Hello ${req.user.displayName}`);
    console.log(req.user);
    res.render('calendar', { user: req.user });
});

app.post("/calendar", isLoggedIn, (req, res) => {
    let selectedClass = req.body.class;
    res.send(`You selected ${selectedClass}`);
});

app.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy();
    res.send('Goodbye!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
});