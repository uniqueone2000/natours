// This variable will bring in the NPM 'promisify' method from the NODE 'util' package
const { promisify } = require('util');

// This variable brings in the "crypto" node package
const crypto = require('crypto');

// This brings in the 'jsonwebtoken' npm package
const jwt = require('jsonwebtoken');

// This brings in the 'User' model
const User = require('./../models/userModel');

// This variable imports the 'catchAsync' "Error Handler" function
const catchAsync = require('./../utils/catchAsync');

// This brings in the 'AppError' class
const AppError = require('./../utils/appError');

// This brings in the 'sendEmail' class
const Email = require('./../utils/email');

// This is for the JWT token
const signToken = id => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// This function is used to create and send TOKENS
const createSendToken = (user, statusCode, res) => {
  // This variable uses the jsonwebtoken to create one for the 'New User'
  const token = signToken(user._id);

  // This variable is use to create a 'HTTP Cookie'
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,

    // SSL protocol
    // secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  // This is used to transition between the  'Production' and 'Development' environments
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // This variable is used to create a 'HTTP Cookie' for the web client (SECURE BROWSER ONLY)
  const cookie = res.cookie('jwt', token, cookieOptions);

  // This changes the 'password' property in the response object to 'undefined' (ESPECIALLY WHEN A NEW USER SIGNS UP TO THE APPLICATION)
  user.password = undefined;

  // This sends the 'New User' created response info to the client
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
}

// This is the signup function for the 'New User'
exports.signup = catchAsync (async (req, res, next) => {

  // This variable is used to sign up the 'New User'
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  });

  // This is used to contruct the url for the email message
  const url = `${req.protocol}://${req.get('host')}/me`;

  // This is used to check the url
  console.log(url);

  // This uses the 'Email' class to send a 'Welcome' email
  await new Email(newUser, url).sendWelcome();

  // This calls the 'createSendToken' function to create the new user
  createSendToken(newUser, 201, res);

});

// This is the 'User Login' function
exports.login = catchAsync(async(req, res, next) => {

  // This reads the email and password from the req.body object
  const { email, password } = req.body;

  // STEP 1) This checks to see if the user entered an email or a password
  if (!email || !password) {
    // This sends an 'Error Message' to the client
    return next(new AppError('Please enter your email and password!'), 400);
  }

  // This checks to see if the user exists in the databasse (via their email or username) and if the password is correct

  // This check is for the email
  const user = await User.findOne({ email }).select('+password');

  // TSTEP 2) his checks for whether the submitted email or the password exists
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password'), 401);
  }

  // This is used for testing
  // console.log(user);

  // STEP 3) If BOTH the email and password do exist, this sends the JWT to the client (so they can login)

  // This calls the 'createSendToken' function to send the JWT to the client (so they can login)
  createSendToken(user, 200, res);

});

// ======== START OF USER LOGIN // ========

// This function is used to protect routes (Authentication)
exports.isLoggedIn = async (req, res, next) => {
  // 1) This step gets the JWT and check if it does exist
  if (req.cookies.jwt) {

    try {
      // 1A) This verifies that the JWT has not been altered by comparing it to the JWT Secret
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

      // This is for testing the decoded data
      // console.log(decoded);

      // 2) IF the above steps are successful, this step checks to see if the CURRENT USER still exists
      const currentUser = await User.findById(decoded.id);

      // This statement checks that there is indeed a 'currentUser'
      if (!currentUser) {
        return next();
      }

      // 3) This step checks if the user's password was changed AFTER the JWT was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // IF the user's login process successfully completes the steps above THEN there IS a 'LoggedIn User'
      res.locals.user = currentUser;

      return next();

    } catch (err) {
      return next();
    }
  }
  next();
};

// ======== END OF USER LOGIN // ========

// ======== START OF USER LOGOUT // ========

// This function is used to 'log out' the user
exports.logout = (req, res) => {
  // This sets the cookie WITHOUT a 'Token'
  res.cookie('jwt', 'logged out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    status: 'success',
  });
};

// ======== END OF USER LOGOUT // ========


// ======== START OF USER AUTHENTICATION // ========

// This function is used to protect routes (Authentication)
exports.protect = catchAsync(async (req, res, next) => {
  // 1) This step gets the JWT and check if it does exist

  // This variable is just used to assign the token
  let token;

  // 1a) This finds the header information about the token and pulls the value from the 'key/value' pair
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt && req.cookies.jwt !== 'loggedout')
    {
      token = req.cookies.jwt;
    };

    // } else if (req.cookies.jwt) {
      //   token = req.cookies.jwt;
      // }



  // This is used for testing the token
  // console.log(token);

  // if (token === undefined) return res.redirect('/login')

  // 1b) This checks if the token actually exists
  if (!token) {
    return next(new AppError('You are not currently logged in. Please log in to see the requested information'), 401);
  }


  // 2) This step validates the JWT (verification)

  // This verifies that the JWT has not been altered by comparing it to the JWT Secret
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // This is for testing the decoded data
  console.log(decoded);

  // 3) IF the above steps are successful, this step checks to see if the CURRENT USER still exists
  const currentUser = await User.findById(decoded.id);

  // This statement checks that there is indeed a 'currentUser'
  if (!currentUser) {
    return next(new AppError('This account does not exist in our system.'), 401);
  }

  // 4) This step checks if the user's password was changed AFTER the JWT was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Password mismatch. Pleae login again'), 401);
  }

  // IF the user's login process successfully completes the steps above THEN the 'next()' command below grants them access to the protected route AND SETS THE USER VARIABLE
  req.user = currentUser;

  // IF the user's login process successfully completes the steps above THEN there IS a 'LoggedIn User'
  res.locals.user = currentUser;
  next();

});

// ======== END OF USER AUTHENTICATION // ========

// ======== START OF USER AUTHORIZATION // ========

// This function is used to define user roles (Authrization)
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // This statement checks to see if the user is in the 'restrictTo' field
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action'), 403);
    }
    next();
  };
};

// ======== END OF USER AUTHORIZATION // ========

// ======== START OF (FORGOTTEN) PASSWORD RESET // ========

// This function is used to to allow a user to REQUEST a password reset
exports.forgotPassword = catchAsync(async(req, res, next) => {

  // 1) This step gets the CORRECT user from their posted email
  const user = await User.findOne({ email: req.body.email });

  // This checks to see if the user exists on this application
  if (!user) {
    return next(new AppError('The email address submitted does not exist on this server'), 404);
  }

  // 2) This step generates the 'Random Reset' token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });


  // This sends the email
  try {
    // 3) This step sends the 'Random Reset' token as an Email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    // This method uses the nodemailer package in 'email.js'
    await new Email(user, resetURL).sendPasswordReset();

    // This is the SUCCESS response status
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    });

  } catch (err) {
    // This is the ERROR response status
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Please try again later'), 500);
  }

});

// This function is used to to allow a user to RE-SET their password
exports.resetPassword = catchAsync(async (req, res, next) => {

  // 1) This step gets the correct user based on the token provided

  // This variable encrypts the reset token to compare it to the one in the DB
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  // This variable gets user from the from the DB based on the 'hashedToken'
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  }) ;

  // 2) This step sets the new password ONLY if the reset token HAS NOT expired AND the correct user exists

  // This checks if there is no 'User'
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // This sets the password property
  user.password = req.body.password;

  // This sets the password confirmation property
  user.passwordConfirm = req.body.passwordConfirm;

  // This deletes the 'passwordResetToken' token
  user.passwordResetToken = undefined;

  // This deletes the 'passwordResetExpires' property
  user.passwordResetExpires = undefined;

  // This updates the user's password in the database
  await user.save();

  // 3) This step updates the 'changedPasswordAt' property of the user


  // 4) This step sends the new JWT to the user for them to login

  // This sends the JWT to the client (so they can login)
  createSendToken(user, 200, res);

});

// ======== END OF (FORGOTTEN) PASSWORD RESET // ========

// ======== START OF PASSWORD CHANGE // ========

// This function is used to to allow a user to UPDATE/CHANGE their password
exports.updatePassword = catchAsync(async (req, res, next) => {

  // 1) This step gets the correct user from the DB

  // This variable is used to ask the user to provide their current password
  const user = await User.findById(req.user.id).select('+password');


  // 2) This step checks if the password they supplied (their current password) is correct

  // This checks if the provided password is NOT correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Incorrect Password Provided!', 401));
  }

  // 3) IF the current password is correct, allow the user to update their password

  // This sets the password property
  user.password = req.body.password;

  // This sets the password confirmation property
  user.passwordConfirm = req.body.passwordConfirm;

  // This updates the user's password in the database
  await user.save();

  // 4) This step sends the user the updated JWT so they can login

  // This sends the JWT to the client (so they can login)
  createSendToken(user, 200, res);

});


// ======== END OF PASSWORD RESET // ========
