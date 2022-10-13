// This brings in the 'Shparp' NPM package to resize or process images
const sharp = require('sharp');

// This brings in the 'Multer' NPM package to upload files of many types
const multer = require('multer');

// This variable imports the 'User' model
const User = require('./../models/userModel');

// This variable imports the 'catchAsync' "Error Handler" function
const catchAsync = require('./../utils/catchAsync');

// This brings in the 'AppError' class
const AppError = require('./../utils/appError');

// This brings in the 'Handler Factory' function that handles the handler functions
const factory = require('./handlerFactory');

// This variable allows multer to access 'disk storage'
// const multerStorage = multer.diskStorage({
//   // This is for where the file is to be stored
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   // This for constructing the name of the file
//   filename: (req, file, cb) => {
//     // This variable gets the type of file
//     const ext = file.mimetype.split('/')[1];
//
//     // This gets the id and time stamp of the user and adds it to the extension
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

// This is the updated MULTER function
const multerStorage = multer.memoryStorage();

// This variable uses multer to create a filter to ensure the file is an IMAGE (in this application. It can be configured to filter on the desired file type)
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image. Please upload images only.', 400), false);
  }
};

// This uses Multer to upload images
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

// This function allows the user to upload their user profile photo
exports.uploadUserPhoto = upload.single('photo');

// This function is used to RESIZE IMAGES to fit our application
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  // This first checks to see if a file was uploaded
  if (!req.file) return next();

  // This variable is for the file name of the image
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // This uses the 'sharp' NPM Package to resize the image
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

    next();
});


// This function filters out the 'protected' fields from the 'user.body' object
const filterObj = (obj, ...allowedFields) => {

  const newObj = {};

  Object.keys(obj).forEach(el => {
    if(allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

// This function allows a user to retrieve their own data from this application
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
}

// This function allows the user to update their user data
exports.updateMe = catchAsync(async (req, res, next) => {

  // 1) This creates an error if user posts password data (this is done in the 'authController')
  if (req.body.password || req.passwordConfirm) {
    return next(new AppError('You cannot change passwords here. Please use the "Forgot Password " link', 400));
  }

  // 2) This variable uses the 'filterObj' function to omit 'protected' fields
  const filteredBody = filterObj(req.body, 'name', 'email');

  // This checks to see if the user is also updating their profile image
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) This finds the correct user and updates the user Document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  // This is the 'success' response message
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });

  next();
});

// This function is used when a user wants to delete their account
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  // This is the 'success' response message
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// This function creates a single user in the database
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined. Please use the "SignUp" page to complete this action.'
  });
};

// This is the new handler function that 'GETS' ALL Users
exports.getAllUsers = factory.getAll(User);

// This is the new handler function that 'GETS' ONE User
exports.getUser = factory.getOne(User);

// This is the new handler function that 'UPDATES' ONE User (all EXCEPT the password)
exports.updateUser = factory.updateOne(User);

// This is the new handler function that 'DELETES' ONE User
exports.deleteUser = factory.deleteOne(User);
