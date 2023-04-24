var passport = require("passport");
var JwtStrategy = require("passport-jwt").Strategy;
var ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/user");
require("dotenv").config();

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
opts.secretOrKey = process.env.SECRET_KEY;

passport.use(
  new JwtStrategy(opts, function (jwt_payload, done) {
    var user = User.findById(jwt_payload.id);

    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  })
);

exports.isAuthenticated = passport.authenticate("jwt", { session: false });
exports.secret = opts.secretOrKey;
