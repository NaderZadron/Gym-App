const User = require("../models/user");
module.exports.isAdmin = () => {
  return async function (req, res, next) {

    const user = await User.findById(req.session.passport.user.id);

    if (!user) {
      console.log("[ERROR - Unable to find User]");
      return res.status(403).json({ error: { status: 403, message: "Access denied." } });
    }
    else if (user.position !== "admin" && user.position !== "coach") {
      console.log("[ERROR - User does not have admin or coach position]");
      return res.status(403).json({ error: { status: 403, message: "Access denied." } });
    }
    else {
      console.log("[isAdmin successfully verified]");
      next();
    }

  };
};
