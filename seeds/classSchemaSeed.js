const mongoose = require("mongoose");
const db = require("../models/class");

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

async function populateClassDB() {
  await db.deleteMany({}); // Deletes everthing in database

  // Dummy Data for testing
  const class1 = new db({
    dateOfClass: "03/10/2054",
    timeOfClass: "13:30",
    trainerName: "Mike Tyson",
    capacity: 25,
    typeOfClass: "Boxing",
    location: "Limitless Gym",
  });
  const class2 = new db({
    dateOfClass: "06/05/2029",
    timeOfClass: "08:00",
    trainerName: "Ashley Jenkens",
    capacity: 10,
    typeOfClass: "MMA",
    location: "Limitless Gym",
  });
  const class3 = new db({
    dateOfClass: "12/29/2040",
    timeOfClass: "18:45",
    trainerName: "John Jones",
    capacity: 40,
    typeOfClass: "Yoga",
    location: "Limitless Gym",
  });
  const class4 = new db({
    dateOfClass: "08/09/2035",
    timeOfClass: "23:15",
    trainerName: "Smith Laex",
    capacity: 35,
    typeOfClass: "Jiu Jitsu",
    location: "Limitless Gym",
  });
  const class5 = new db({
    dateOfClass: "01/01/2032",
    timeOfClass: "07:45",
    trainerName: "John Jones",
    capacity: 20,
    typeOfClass: "Wrestling",
    location: "Limitless Gym",
  });
  await class1.save();
  await class2.save();
  await class3.save();
  await class4.save();
  await class5.save();
}

populateClassDB().then(() => {
  mongoose.connection.close();
});
