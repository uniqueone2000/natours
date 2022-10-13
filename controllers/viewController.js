// This variable imports the 'Tour' model
const Tour = require('../models/tourModel');

// This variable imports the 'User' model
const User = require('../models/userModel');

// This variable imports the 'Booking' model
const Booking = require('../models/bookingModel');

// This variable imports the 'catchAsync' "Error Handler" function
const catchAsync = require('../utils/catchAsync');

// This variable imports the 'AppError' "Error Handler" function
const AppError = require('../utils/appError');

const csp = "default-src 'self' https://js.stripe.com/v3/ https://cdnjs.cloudflare.com https://api.mapbox.com; base-uri 'self'; block-all-mixed-content; connect-src 'self' https://js.stripe.com/v3/ https://cdnjs.cloudflare.com/ https://*.mapbox.com/; font-src 'self' https://fonts.google.com/ https: data:;frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src 'self' https://js.stripe.com/v3/ https://cdnjs.cloudflare.com/ https://api.mapbox.com/ blob:; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests;";

// This handler function creates the 'overview' function for ALL THE TOURS
exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) This gets the Tour data from the collection
  const tours = await Tour.find();

  res.status(200)
    .set('Content-Security-Policy', csp)
    .render('overview', {
      title: 'All Tours',
      tours
    });
});

// This handler function creates the 'get Tour' function. To create ONE Tour Details page
exports.getTour =catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({slug: req.params.slug}).populate({
    path: 'reviews',
    fields: 'review rating user'
  })
  // This is Error handling for this function
  if (!tour) {
    return next(new AppError('There is no tour with that name...', 404));
  }

  res.status(200)
    .set('Content-Security-Policy', csp)
    .render('tour', {
      title: `${tour.name} Tour`,
      tour
    });
});

// This handler function is for the 'getLoginForm'
exports.getLoginForm = (req, res) => {
  res.status(200)
    .set('Content-Security-Policy', csp)
    .render('login', {
      title: 'Log into your account'
    });
};

// This handler function is for the 'User Account' page
exports.getAccount = (req, res) => {
  res.status(200)
    .set('Content-Security-Policy', csp)
    .render('account', {
      title: 'Manage Your Account Here'
    });
};

// This handler function is used to allow the user to see their booked tours
exports.getMyTours = catchAsync(async (req, res, next) => {

  // 1) This finds all the bookings (for the selected user)
  const bookings = await Booking.find({ user: req.user.id });

  // 2) This finds the tours with the returned IDs (for the selected user)
  const tourIDs = bookings.map(el => el.tour);

  const tours = await Tour.find({ _id: { $in: tourIDs } });

  // This renders all the tours that are booked to the client
  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});


// This handler function allows the user to update their user data
exports.updateUserData = catchAsync(async (req, res, next) => {
  // This variable is used to find the user
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      // This is the data from the user form
      name: req.body.name,
      email: req.body.email
    },
    {
      // This is the updated data from the user on the user form
      new: true,
      runValidators: true
    }
  );

  // This renders the updated user account page
  res.status(200).render('account', {
    title: 'Your Account Info has been updated',
    user: updatedUser
  });
});
