if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const User = require("./models/user"); // User schema
var authRouter = require("./routes/auth");
const classRouter = require("./routes/class");
const userRouter = require("./routes/user");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const LocalStrategy = require("passport-local").Strategy;
const crypto = require("crypto");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const specs = require("./swagger");
const cookieParser = require("cookie-parser");

app.use(
  cors({
    origin: "https://127.0.0.1:3000" || process.env.REACT_URI,
    credentials: true,
  })
);
/* Sanitize Mongo */
app.use(mongoSanitize());

/* Secure API */
app.use(helmet());
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Content-Security-Policy", "default-src 'self'");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  // if (req.cookies && req.cookies.sid) {
  //   res.cookie("sid", req.cookies.sid, { httpOnly: true, secure: true });
  // }
  res.setHeader("Access-Control-Allow-Origin", "https://127.0.0.1:3000/"); // Replace with your client-side domain
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.DB_URI || "mongodb://localhost:27017/gymApp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database Connected"))
  .catch((err) => {
    console.log("Error", err);
  });

/* Middleware */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());
app.use(
  session({
    secret: process.env.SECRET,
    name: "session",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DB_URI || "mongodb://localhost/gymApp",
      ttl: 60 * 60 * 24, // session expiration time in seconds
      secret: process.env.SECRET,
      touchAfter: 24 * 60 * 60,
    }),
  })
);
app.use(passport.authenticate("session"));

// Register the authentication middleware with the Express app
app.use(passport.initialize());
app.use(passport.session());

// Configure PassportJS to serialize and deserialize user objects
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, {
      id: user.id,
      username: user.emailAddr,
    });
  });
});
passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user.id);
  });
});

// Configure PassportJS to use the local authentication strategy
passport.use(
  new LocalStrategy(function (username, password, cb) {
    User.findOne(
      { emailAddr: username },
      "password salt hash",
      function (err, user) {
        if (err) {
          return cb(err);
        }
        if (!user) {
          return cb(null, false, {
            message: "Incorrect username or password.",
          });
        }
        crypto.pbkdf2(
          password,
          user.salt,
          310000,
          32,
          "sha256",
          function (err, hashedPassword) {
            if (err) {
              return cb(err);
            }
            if (
              !crypto.timingSafeEqual(
                Buffer.from(user.password, "hex"),
                Buffer.from(hashedPassword, "hex")
              )
            ) {
              return cb(null, false, {
                message: "Incorrect username or password.",
              });
            }
            return cb(null, user);
          }
        );
      }
    );
  })
);

// error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error",
  });
});

/* Prevent DoS attacks */
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

/* Swagger */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

/* API routes */
app.use("/", authRouter); // Authentication Routes
app.use("/class", classRouter); // Class Routes
app.use("/user", userRouter); // User Routes
app.get("/", (req, res) => {
  res.status(200).json({
    message:
      "Thank you for logining in. Welcome to the gym app. This is the home page",
  });
});
app.use("*", (req, res, next) => {
  res.status(404).send("*Page Not Found");
});
/* Start server logic */
const PORT = process.env.PORT || 6001;
app.listen(PORT, () => {
  console.log(`Our app is running on port ${PORT}`);
});
module.exports = app; // For unit testing purposes
