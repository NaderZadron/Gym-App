const mongoose = require("mongoose");
const db = require("../models/user");
const crypto = require("crypto");

/* Connecting to mongodb on local machine */
mongoose.set("strictQuery", false);
mongoose.connect(
  process.env.DATABASE_URL || "mongodb://localhost:27017/gymApp",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error:")
);
mongoose.connection.once("open", () => {
  console.log("Database connected");
});

// Use this function only once
async function populateUserDB() {
  // Generate a random salt value and use it to hash the user's password
  var password = "Admin1234";
  const salt = crypto.randomBytes(16).toString("hex");
  const hashedPassword = await new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      310000,
      32,
      "sha256",
      (err, hashedPassword) => {
        if (err) {
          return reject(new Error("Error hashing password"));
        }
        resolve(hashedPassword.toString("hex"));
      }
    );
  });
  // Create a new user document in the database
  const admin = new db({
    emailAddr: "Admin@gmail.com",
    salt: salt.toString(),
    password: hashedPassword.toString("Hex"),
    firstName: "Admin",
    lastName: "Admin",
    address: "Admin",
    position: "admin",
  });
  await admin.save();
}

populateUserDB().then(() => {
  mongoose.connection.close();
});
