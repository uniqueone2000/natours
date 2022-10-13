// This variable imports the 'catchAsync' "Error Handler" function
const catchAsync = require('./../utils/catchAsync');

// This variable imports the 'APIFeatures' utility
const APIFeatures = require('./../utils/apiFeatures');

// This brings in the 'application error handling utility'
const AppError = require('./../utils/appError');

// This 'Handler Function' is used to DELETE ONE resource
exports.deleteOne = Model => catchAsync(async (req, res, next) => {

  // This variable finds the Document with requested ID to delete
  const doc = await Model.findByIdAndDelete(req.params.id);

  // This is the error handler if no Model is found
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  // This is the success status and response code
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// This 'Handler Function' is used to UPDATE ONE resource
exports.updateOne = Model => catchAsync(async (req, res, next) => {
  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }
  );

  // This is the error handler if no Tour is found
  if (!doc) {
    return next(new AppError('No Document found with that ID', 404));
  }

    // This is the success status and response code
  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  });
});

// This 'Handler Function' is used to CREATE ONE resource
exports.createOne = Model => catchAsync(async (req, res, next) => {

  // This creates a 'New Tour'
  const doc = await Model.create(req.body);

  // This is the success status and response code
  res.status(201).json({
    status: 'success',
    data: {
      data: doc
    }
  });
});

// This 'Handler Function' is used to GET ONE resource
exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {

  // This variable creates a 'query' object for the 'populate' portion of this function
  let query = Model.findById(req.params.id);

  if (popOptions) query = query.populate(popOptions);
  const doc = await query;

  // This is the error handler if no Model is found
  if (!doc) {
    return next(new AppError('No Document found with that ID', 404));
  }

  // This is the success status and response code
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
});

// This 'Handler Function' is used to GET ALL resources
exports.getAll = Model => catchAsync(async (req, res, next) => {

  // If there is no 'nested route' the filter will not populate a with a review
  let filter = {};

  // This checks if there is a tourId. If so only then will the filter populate the nested route with reviews related to the tourId
  if (req.params.tourId) filter = { tour: req.params.tourId };

  // This variable uses the 'APIFeatures' Class
  const features = new APIFeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // This version done for explaining or showing the index for testing
  // const doc = await features.query.explain();

  // This is the result of the query
  const doc = await features.query;


  // This is the SUCCESS RESPONSE code
  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: {
      data: doc
    }
  });
});









// ======== KEEP THIS AS A BASIC EXAMPLE OF HANDLER FUNCTIONS // ======== //

// // This function 'DELETES' a Tour
// exports.deleteTour = catchAsync(async (req, res, next) => {
//
//   // This variable finds the Tour with requested ID to delete
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//
//   // This is the error handler if no Tour is found
//   if (!tour) {
//     return next(new AppError('No Tour found with that ID', 404));
//   }
//
//   // This is the success status and response code
//   res.status(204).json({
//     status: 'success',
//     data: null
//   });
// });
