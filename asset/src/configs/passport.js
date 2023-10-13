const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;


// Passport Đăng nhập bằng Google
passport.use(
    new GoogleStrategy({
        clientID: '719235217594-skuvtrsk3jm4frqgm74btafk2ru1tuli.apps.googleusercontent.com',
        clientSecret: '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',
        callbackURL: "/dang-nhap/google/callback",
        scope: ['email', 'profile']
    }, (accessToken, refreshToken, profile, done) => {
        done(null, profile);
    })
);

// Passport đăng nhập bằng Facebook
passport.use(
    new FacebookStrategy({
        clientID: '1024863065605208',
        clientSecret: '705dd056a08bcd8463d52f84a2d2adb0',
        callbackURL: "/dang-nhap/facebook/callback",
        profileFields: ['id', 'displayName', 'photos', 'email', 'gender', 'birthday']
    }, (accessToken, refreshToken, profile, done) => {
        done(null, profile);
    })
);


passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    // Lấy người dùng từ id
    done(null, user);
});


module.exports = passport;