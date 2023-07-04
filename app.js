const express = require('express');
const session = require('express-session');
const passport = require('passport');
const config = require('config');
const Queries = require('./src/queries');
require('./src/auth');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var classes = {};
// dictionary with String id (class name with no spaces) as key and String class name as value
// load classes from config.classes
config.get('classes').forEach((className) => {
    classes[className.replace(/\s/g, '')] = className;
});

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
    res.render('calendar', { user: req.user });
});

app.get('/tutor', isLoggedIn, (req, res) => {
    let isTutor = config.get('nhsMembers').includes(req.user.emails[0].value);
    if (!isTutor) {
        res.redirect('/calendar');
    }
    res.render('tutor', { user: req.user, classes: classes });
});

app.post("/tutor", isLoggedIn, (req, res) => {
    let isTutor = config.get('nhsMembers').includes(req.user.emails[0].value);
    if (!isTutor) {
        res.redirect('/calendar');
    }
    /*
            {{#each classes}}
        <input type="checkbox" id="{{@key}}" name="{{@key}}">{{this}}<br>
        {{/each}}
        */
    let selectedClasses = [];
    for (let className in classes) {
        if (req.body[className]) {
            selectedClasses.push(className);
        }
    }
    // updateTutorSubjects
    Queries.updateTutorSubjects(req.user.sub, selectedClasses);

    res.send(`You selected ${selectedClasses}`);
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