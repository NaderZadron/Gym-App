const mongoose = require("mongoose");
const db = require("../models/user");

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

async function populateUserDB() {
  await db.deleteMany({}); // Deletes everthing in database

  // Member
  const user1 = new db({
    // username: "Tim2",
    password: "Test1234",
    firstName: "Tim",
    lastName: "Popavitch",
    address: "123 E founder pkwy, Los Angeles, California, 59403",
    emailAddr: "tim2@gmail.com",
    position: "member",
  });
  // Coach
  const user2 = new db({
    // username: "Coach",
    password: "Coach1234",
    firstName: "Coach",
    lastName: "Carter",
    address: "1423 E loa pkwy, Los Angeles, California, 67584",
    emailAddr: "coach2@gmail.com",
    position: "coach",
  });
  // Admin
  const user3 = new db({
    // username: "Admin",
    password: "Admin1234",
    firstName: "Admin",
    lastName: "Whoisthis",
    address: "232 W Waters Ave, Maimi, Florida, 209393",
    emailAddr: "admin2@gmail.com",
    position: "admin",
  });
  await user1.save();
  await user2.save();
  await user3.save();
}

populateUserDB().then(() => {
  mongoose.connection.close();
});
