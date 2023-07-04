const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const dotenv = require('dotenv');
const Queries = require('./queries');
const config = require('config');
dotenv.config();
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/callback",
    passReqToCallback: true,
},
    function (request, accessToken, refreshToken, profile, done) {
        if (config.get('nhsMembers').includes(profile.emails[0].value)) {
            Queries.getTutorByGoogleSub(profile.sub).then((tutor) => {
                if (!tutor) {
                    Queries.createTutor(profile.sub, profile.emails[0].value, profile.displayName);
                }
            });
        }
        return done(null, profile);
    }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});
