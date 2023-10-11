const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// passport.use(
//     new GoogleStrategy(
//         {
//             clientID: '719235217594-skuvtrsk3jm4frqgm74btafk2ru1tuli.apps.googleusercontent.com',
//             clientSecret: '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',
//             callbackURL: '/dang-nhap/google/callback',
//         },
//         (accessToken, refreshToken, profile, done) => {
//             // xử lý chức năng gì đó
//             return done(null, profile);
//         }
//     )
// );

// passport.serializeUser((user, done) => {
//     done(null, user);
// });

// passport.deserializeUser((user, done) => {
//     done(null, user);
// });


passport.use(
    new GoogleStrategy({
        clientID: '719235217594-skuvtrsk3jm4frqgm74btafk2ru1tuli.apps.googleusercontent.com',
        clientSecret: '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',
        callbackURL: "/dang-nhap/google/callback",
        scope: ['email', 'profile']
    },
        (accessToken, refreshToken, profile, done) => {
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