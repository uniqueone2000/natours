// This brings in the 'Express' NPM package
const express = require('express');

// This brings in the 'User' Controller
const userController = require('./../controllers/userController');

// This brings in the 'User's 'Authentication' Controller
const authController = require('./../controllers/authController');

const router = express.Router();

// This route is used when a 'New User' signs up for this application
router
  .post('/signup',
    authController.signup
  );

// This route is used when a 'New User' "Logs In" to this application
router
  .post('/login',
    authController.login
  );

  // This route is used to 'Log Out' of this application
  router
  .get('/logout',
  authController.logout
);

// This route is used when a 'User' needs to REQUEST a password reset
router
  .post('/forgotPassword',
    authController.forgotPassword
  );

// This route is used for a 'User' to RE-SET A FORGOTTEN password
router
  .patch('/resetPassword/:token',
    authController.resetPassword
  );

// This middleware function allows the 'User' to be logged (authenticated) in order to be able to use the routes below
router.use(authController.protect);

// This route is used for a 'User' to UPDATE their password
router
  .patch('/updateMyPassword',
    authController.updatePassword
  );

// This route is used for a 'User' to obtain THEIR OWN User INFORMATION
router
  .get('/me',
  userController.getMe,
  userController.getUser
);

// This route is used for a 'User' to UPDATE their USER INFORMATION
router
  .patch('/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);


// This route is used for a 'User' to 'DELETE' their account
router
  .delete('/deleteMe',
    userController.deleteMe
  );

  // This middleware function ONLY allows the 'Admins' to be logged (authenticated) in order to be able to use the routes below
  router.use(authController.restrictTo('admin'));

// These routes pertain to a ALL Users
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

// These routes pertain to a SPECIFIC User
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
