const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

// Middleware to verify JWT and attach user to req.user
exports.requireAuth = async (req, res, next) => {
	// Get token from Authorization header
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ error: "No token provided" });
	}
	const token = authHeader.split(" ")[1];
	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		// Attach user info to req.user (include _id and userId)
		const user = await User.findOne({ userId: decoded.userId });
		if (!user) return res.status(401).json({ error: "User not found" });
		req.user = {
			id: user.userId,
			_id: user._id,
			name: user.name,
			email: user.email
		};
		next();
	} catch (err) {
		return res.status(401).json({ error: "Invalid or expired token" });
	}
};
