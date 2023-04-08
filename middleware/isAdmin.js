const User = require("../models/user");
module.exports.isAdmin = () => {
  return async function (req, res, next) {
    const user = await User.findById(req.session.passport.user.id);
    if (!user || (user.position !== "admin" && user.position !== "coach")) {
      return res
        .status(403)
        .json({ error: { status: 403, message: "Access denied." } });
    }
    next();
  };
};
