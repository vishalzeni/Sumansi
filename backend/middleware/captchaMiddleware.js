const axios = require("axios");

/**
 * Verify hCaptcha token middleware
 * Works in both development and production.
 */

// Startup validation: ensure secret present in production
const HCAPTCHA_SECRET = process.env.HCAPTCHA_SECRET;
if (!HCAPTCHA_SECRET && process.env.NODE_ENV === "production") {
	// Fail fast in production so deployers notice config error immediately
	throw new Error("HCAPTCHA_SECRET is required in production environment");
}

// NOTE: Removed in-memory caching. hCaptcha tokens are single-use — caching can allow replay.

module.exports = async function captchaVerify(req, res, next) {
  try {
    // Accept token from multiple common locations to avoid client naming issues
    const token =
      req.body?.hcaptchaToken ||
      req.body?.captchaToken ||
      req.body?.token ||
      req.body?.["g-recaptcha-response"] ||
      req.headers["x-hcaptcha-token"] ||
      req.headers["h-captcha-response"] ||
      req.headers["g-recaptcha-response"] ||
      req.query?.hcaptchaToken ||
      req.query?.captchaToken ||
      req.query?.token;

    const secret = HCAPTCHA_SECRET || process.env.HCAPTCHA_SECRET;

    if (!secret) {
      console.error("❌ HCAPTCHA_SECRET missing in environment");
      return res.status(500).json({ error: "Server misconfiguration" });
    }


    if (!token) {
      // Provide actionable hint to client developer for debugging
      return res.status(400).json({
        error: "Captcha token is required",
        hint:
          "Provide token in one of: body.hcaptchaToken, body.captchaToken, body.token, body['g-recaptcha-response'], query.token or header 'x-hcaptcha-token'.",
      });
    }

    // Verify with hCaptcha API with a small retry for transient network errors
    const verifyUrl = process.env.HCAPTCHA_VERIFY_URL || "https://hcaptcha.com/siteverify";
    const maxRetries = 1;
    let attempt = 0;
    let lastError = null;
    let data = null;

    while (attempt <= maxRetries) {
      try {
        const response = await axios.post(
          verifyUrl,
          new URLSearchParams({
            secret,
            response: token,
            remoteip: req.ip,
          }),
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            timeout: 5000, // 5s timeout
          }
        );
        data = response.data;
        break;
      } catch (err) {
        lastError = err;
        const status = err?.response?.status;
        if (status && status >= 400 && status < 500) {
          // client error — don't retry
          break;
        }
        attempt++;
        // small backoff
        await new Promise((r) => setTimeout(r, 200 * attempt));
      }
    }

    if (!data) {
      console.error("⚠️  HCaptcha verification error:", lastError?.message || "no response");
      return res.status(503).json({ error: "Captcha verification service unavailable" });
    }

    if (!data.success) {
      console.warn("⚠️  HCaptcha verification failed:", data["error-codes"] || data);
      return res.status(401).json({ error: "Captcha verification failed", details: data["error-codes"] || null });
    }

    // All good
    next();
  } catch (error) {
    console.error("⚠️  HCaptcha verification unexpected error:", error.message);
    return res.status(500).json({ error: "Captcha verification error" });
  }
};
