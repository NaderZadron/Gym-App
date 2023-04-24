const User = require("../models/user");
const jwt = require("jsonwebtoken");
module.exports.isAdmin = () => {
  return async function (req, res, next) {
    const token = req.headers.authorization.split(" ")[1]; // Get the token from the Authorization header
    const decoded = jwt.verify(token, process.env.SECRET_KEY); // Decode the token using the secret key
    const userId = decoded.id;
    const user = await User.findById(userId);

    if (!user) {
      console.log("[ERROR - Unable to find User]");
      return res
        .status(403)
        .json({ error: { status: 403, message: "Access denied." } });
    } else if (user.position !== "admin" && user.position !== "coach") {
      console.log("[ERROR - User does not have admin or coach position]");
      return res
        .status(403)
        .json({ error: { status: 403, message: "Access denied." } });
    } else {
      console.log("[isAdmin successfully verified]");
      next();
    }
  };
};
