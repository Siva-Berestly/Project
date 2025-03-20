const User = require("../Models/User");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Environment variables - replace with your actual values in production
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Configure nodemailer with improved setup
let transporter;

// Function to create and verify the email transporter
const setupTransporter = async () => {
  // Create reusable transporter object
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Verify connection configuration
  try {
    await transporter.verify();
    console.log("Email server is ready to send messages");
    return true;
  } catch (error) {
    console.error("Email server verification failed:", error);
    return false;
  }
};

// Initialize the transporter
setupTransporter();

// Login handler
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    try {
      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (pwError) {
      console.error("Password comparison error:", pwError);
      return res.status(500).json({ message: "Authentication error" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Forgot password handler
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, always return success even if email doesn't exist
      return res.json({
        message: "Password reset instructions sent if email exists",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token and save to user
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Create reset URL
    const resetUrl = `${CLIENT_URL}/reset-password/${resetToken}`;

    // Try to send email
    let emailSent = false;

    // Make sure transporter is set up
    const isTransporterValid = await setupTransporter();

    if (isTransporterValid) {
      try {
        // Send email with reset link
        const mailOptions = {
          from: `"Study Platform" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "Password Reset Request",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4a6ee0;">Password Reset Request</h2>
              <p>You are receiving this email because you (or someone else) has requested a password reset for your account.</p>
              <p>Please click on the following link to complete the process:</p>
              <p><a href="${resetUrl}" style="background-color: #4a6ee0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
              <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
              <p>This link will expire in 1 hour.</p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        emailSent = true;
        console.log("Password reset email sent to:", user.email);
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Continue with response - we'll handle the email failure but still save the token
      }
    }

    res.json({
      message: "Password reset instructions sent if email exists",
      // Include token in response only in development environment
      ...(process.env.NODE_ENV === "development" && {
        resetToken,
        resetUrl,
        emailSent,
        note: "Token is included only in development mode. In production, this would only be sent via email.",
      }),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset password handler
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Hash token to compare with stored token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user by token and check expiration
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Update password and clear reset fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
