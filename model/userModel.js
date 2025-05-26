const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
    firstName :{
        type: String,
        required: [true, 'First name is required'],
        minlength: [2, 'First name must be at least 2 characters'],
        maxlength: [30, 'First name cannot exceed 30 characters']},
    lastName :{
        type: String,
        required: [true, 'Last name is required'],
        minlength: [2, 'Last name must be at least 2 characters'],
        maxlength: [30, 'Last name cannot exceed 30 characters']
    },
    email:{
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
    },
    password:{
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
      },
    phone:{
        type: String,
        required:[true, 'Phone number is required'],
        match: [/^\d{10}$/, 'Phone number must be exactly 10 digits']
    },
    role:{
        type: String,
        required:[true,'role is required']
    },
    answer:{
        type: String,
        required:[true,'this field is required']
    },
    resetToken: String,
    resetTokenExpiry: Date,
})

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;