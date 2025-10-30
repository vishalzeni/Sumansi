const rateLimit = require("express-rate-limit");

exports.signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 8, // limit each IP to 8 signup requests per windowMs
  message: { error: "Too many signup attempts, please try again later." },
});

exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 login requests per windowMs
  message: { error: "Too many login attempts, please try again later." },
});
