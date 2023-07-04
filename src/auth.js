const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const Queries = require('./queries');
const config = require('config');

passport.use(new GoogleStrategy({
    clientID: config.get('auth.google_client_id'),
    clientSecret: config.get('auth.google_client_secret'),
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
