// This variable brings in the "crypto" node package
const crypto = require('crypto');

// This variable brings in the "mongoose" npm package
const mongoose = require('mongoose');

// This variable pulls in the "validator" npm package
const validator = require('validator');

// This brings in the 'bcrypt' npm package
const bcrypt = require('bcryptjs');

// This is the Schema used to create a 'User'
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [
      true, 'A user must have a name',
    ]
  },
  email: {
    type: String,
    required: [
      true, 'A user must have an Email Address',
    ],
    unique: true,
    lowercase: true,
    validate: [
      validator.isEmail,
      'Please enter a valid Email Address'
    ]
  },
  photo: {
    type: String,
    default: 'default.jpg'
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [
      true,
      'Please provide a password'
    ],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [
      true,
      'Please confirm your password',
    ],
    validate: {
      // This portion of the validator only works upon 'CREATE' or 'SAVE' (NOT on 'UPDATE')
      validator: function (el) {
        return el === this.password;
      },
      // This is the error message for the password validator
      message: 'Passwords do not match!'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

///// ===== START OF 'PASSWORD ENCRYPTION' ///// =====

// This is 'PRE SAVE' Mongoose Document Middleware
userSchema.pre('save', async function (next) {
  // This runs only when the 'PASSWORD' has been modified
  if (!this.isModified('password')) return next();

  // This uses 'bcrypt' to 'hash' the password
  this.password = await bcrypt.hash(this.password, 12)

  // This deletes the passwordConfirm value
  this.passwordConfirm = undefined;

  next();
});

///// ===== END OF 'PASSWORD ENCRYPTION' ///// =====

///// ===== START OF 'INACTIVE USER QUERY' FUNCTION ///// =====

userSchema.pre(/^find/, function(next) {
  // This will be performed "BEFORE" all "FIND" querries in this application
  this.find({ active: { $ne: false } });

  next();
});

///// ===== END OF 'INACTIVE USER QUERY' FUNCTION ///// =====

///// ===== START OF 'PASSWORDCHANGEDAT' FUNCTION ///// =====

// This resets the 'passwordChangeAt' property before a user gets saved
userSchema.pre('save', function(next) {
  // This checks if the password is new or has been modified
  if (!this.isModified('password')|| this.isNew) return next();

  // This sets the 'passwordChangeAt' property to right now
  this.passwordChangeAt = Date.now() - 1000;

  next();
});

// This function checks the 'LOGIN' password against the 'SIGNUP' password (using an 'INSTANCE' method)
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// This function checks to see if the user's password has been changed since last Login
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {

  // This checks if the password was changed
  if (this.passwordChangedAt) {

    // This variable gets the Timestamp in milliseconds
    const changedTimestamp = parseInt(this.passwordChangeAt.getTime() / 1000, 10);

    // This is for testing the JWTTimestamp and the passwordChangeAt variables
    // console.log(changedTimestamp, JWTTimestamp);

    // This means that the password WAS CHANGED since their last login session (using the JWTTimestamp as a reference)
    return JWTTimestamp < changedTimestamp;
  }
  // This means that the password WAS NOT CHANGED since their last login session (using the JWTTimestamp as a reference)
  return false;
};

///// ===== END OF 'PASSWORDCHANGEDAT' FUNCTION ///// =====

///// ===== START OF 'PASSWORD RESET TOKEN' ///// =====

// This function is used to create the 'Password Reset Token'
userSchema.methods.createPasswordResetToken = function() {

  // This variable uses the crypto package to generate the token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // This creates the 'hash' for the token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // This is used for testing the 'resetToken' and the 'passwordResetToken'
  console.log({ resetToken }, this.passwordResetToken);

  // This is used to manage the 'Expiration Date' for the 'passwordResetToken'
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // This sends a plain text email to the user
  return resetToken;
};

///// ===== END OF 'PASSWORD RESET TOKEN' ///// =====


// This creates the 'User' model from the Schema
const User = mongoose.model('User', userSchema);

module.exports = User;
