const userSchema = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const userRegistration = async (req, res) => {
  try {
    const user = await userSchema.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await userSchema.findOne({ email });

    if (!existingUser) {
      return res.status(401).json({message:"Invalid email or password"})
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: existingUser._id, email: existingUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ message: "Login successful", 
      token,
      user:  {
        id: existingUser._id,
        name: existingUser.firstName,
        email: existingUser.email,
        role: existingUser.role,
      },});
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const userPass = async (req, res) => {
  try {
    const { email, answer } = req.body;
    const user = await userSchema.findOne({ email, answer });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; 

    user.resetToken = token;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      
        transporter.verify(function (error, success) {
        if (error) {
          console.error("Email server connection failed:", error);
        } else {
          console.log("Email server is ready to take messages");
        }
      });

      const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Link",
      html: `<p>You requested a password reset.</p>
             <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
             <p>This link will expire in 1 hour.</p>`,
    };

    await transporter.sendMail(mailOptions);

    console.log(`User found: ${user.email}`);
    console.log(`Reset token: ${token}`);
    console.log(`Sending email to: ${email}`);

    res.status(200).json({ message: "Reset link sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }

};

const passReset = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    const user = await userSchema.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }, 
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { userRegistration, userLogin , userPass, passReset };
