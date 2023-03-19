const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../index");
const mongoose = require("mongoose");
const Class = require("../models/class");

// Configure chai
chai.use(chaiHttp);
chai.should();

describe("Class API tests", () => {
  let server;

  before((done) => {
    // start the server before running tests
    mongoose.set("strictQuery", false);
    mongoose
      .connect(process.env.DB_URI || "mongodb://localhost:27017/gymApp", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("Database Connected");
        server = app.listen(3000, () => {
          console.log("Server started on port 3000");
          done();
        });
      })
      .catch((err) => {
        console.log("Error", err);
        done(err);
      });
  });

  after((done) => {
    // stop the server after running tests
    server.close(() => {
      console.log("Server stopped");
      done();
    });
  });

  describe("GET /class", () => {
    it("Should get all the classes in db", (done) => {
      chai
        .request(app)
        .get("/class")
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
});
