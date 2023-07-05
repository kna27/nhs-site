const express = require('express');
const session = require('express-session');
const nodemailer = require('nodemailer');
const passport = require('passport');
const config = require('config');
const Queries = require('./src/queries');
require('./src/auth');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var classes = {};
config.get('classes').forEach((className) => {
    classes[className.replace(/\s/g, '')] = className;
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.get('server.email.username'),
        pass: config.get('server.email.password')
    }
});

const Handlebars = require("hbs");
Handlebars.registerPartials(__dirname + "/views/partials/", (error) => { if (error) throw error });

Handlebars.registerHelper('contains', function (arr, value) {
    return arr.includes(value);
});

Handlebars.registerHelper('json', function (context) {
    return JSON.stringify(context);
});

app.set("view engine", "hbs");

app.use(express.static(__dirname + "/public"));

function isLoggedIn(req, res, next) {
    req.user ? next() : res.redirect('/');
}

app.use(session({ secret: config.get("server.session_secret"), resave: false, saveUninitialized: true }));
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
    return res.render('calendar', { user: req.user, classes: classes });
});

app.get('/tutor', isLoggedIn, async (req, res) => {
    let isTutor = config.get('nhsMembers').includes(req.user.emails[0].value);
    if (!isTutor) {
        return res.redirect('/');
    }
    let tutorsSubjects = await Queries.getTutorsSubjects(req.user.sub);
    let tutorsAvailability = await Queries.getTutorAvailability(req.user.sub);
    let formattedTutorsAvailability = [];
    for (let day in tutorsAvailability) {
        for (let period of tutorsAvailability[day]) {
            formattedTutorsAvailability.push(`${day}_${period}`);
        }
    }
    res.render('tutor', { user: req.user, classes: classes, tutorsSubjects: tutorsSubjects, tutorAvailability: formattedTutorsAvailability });
});

app.post("/tutor", isLoggedIn, async (req, res) => {
    let isTutor = config.get('nhsMembers').includes(req.user.emails[0].value);
    if (!isTutor) {
        return res.redirect('/');
    }
    let selectedClasses = [];
    for (let className in classes) {
        if (req.body[className]) {
            selectedClasses.push(className);
        }
    }

    let availability = {};
    for (let day = 0; day < 5; day++) {
        availability[day] = [];
        for (let period = 1; period < 10; period++) {
            if (req.body[`${day}_${period}`]) {
                availability[parseInt(day)].push(period);
            }
        }
    }
    for (let day in availability) {
        if (availability[day].length === 0) {
            delete availability[day];
        }
    }

    let tutorsSubjects = await Queries.getTutorsSubjects(req.user.sub);
    if (!(tutorsSubjects.sort().join(',') === selectedClasses.sort().join(','))) {
        await Queries.updateTutorSubjects(req.user.sub, selectedClasses);
    }
    let tutorsAvailability = await Queries.getTutorAvailability(req.user.sub);
    if (!((JSON.stringify(tutorsAvailability) === JSON.stringify(availability)))) {
        await Queries.updateTutorAvailability(req.user.sub, availability);
    }
    return res.redirect('/tutor');
});

app.post("/calendar", isLoggedIn, async (req, res) => {
    if (!req.user) {
        return res.redirect('/');
    }
    let selectedClass = req.body.class;
    let tutors = await Queries.getTutorsBySubject(selectedClass);
    let tutorsAvailability = {};
    for (let tutor of tutors) {
        tutorsAvailability[tutor.name] = await Queries.getTutorAvailability(tutor.google_sub);
    }
    let formattedTutorsAvailability = {};
    for (let tutor in tutorsAvailability) {
        formattedTutorsAvailability[tutor] = [];
        for (let day in tutorsAvailability[tutor]) {
            for (let period of tutorsAvailability[tutor][day]) {
                formattedTutorsAvailability[tutor].push(`${day}_${period}`);
            }
        }
    }
    return res.send(formattedTutorsAvailability);
});

app.post("/request", isLoggedIn, async (req, res) => {
    if (!req.user) {
        return res.redirect('/');
    }
    let tutor = req.body.tutor;
    let student = req.user.displayName;
    let subject = req.body.subject;
    let selectedClass = classes[req.body.classSelect];
    let date = req.body.date;
    let message = req.body.message;
    let tutorEmail = await Queries.getTutorEmailByName(tutor);
    tutorEmail = tutorEmail.email;
    let studentEmail = req.user.emails[0].value;
    if (!message) {
        message = "";
    }
    else {
        message = `\nAdditional message from ${student}:\n\n${message}`
    }
    let emailMessage = `You have a new tutoring request from ${student} for ${selectedClass} on ${date}. Please follow up with them as soon as possible. You can contact them at ${studentEmail}. ${message}`;
    var mailOptions = {
        from: config.get('server.email'),
        to: tutorEmail,
        subject: subject,
        text: emailMessage
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("Error sending email: " + error);
            return res.redirect('/calendar');
        } else {
            mailOptions.text = `This is confirmation that you've requested tutoring from ${tutor} for ${selectedClass} on ${date}. If they do not reach out to you within a few days, you can contact them at ${tutorEmail}.`;
            mailOptions.to = studentEmail;
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log("Error sending email: " + error);
                }
                return res.redirect('/calendar');
            });
        }
    });
});

app.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy();
    return res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
});
