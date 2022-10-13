// This brings in the 'Shparp' NPM package to resize or process images
const sharp = require('sharp');

// This brings in the 'Multer' NPM package to upload files of many types
const multer = require('multer');

// This variable imports the 'Tour' model
const Tour = require('./../models/tourModel');

// This variable imports the 'catchAsync' "Error Handler" function
const catchAsync = require('./../utils/catchAsync');

// This brings in the 'application error handling utility'
const AppError = require('./../utils/appError');

// This brings in the 'Handler Factory' function that handles the handler functions
const factory = require('./handlerFactory');

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

// This function allows the user to upload 'MULTILPE IMAGES'
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

// This function is used to proces the uploaded images
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  // This is just used to check if the images were uploaded
  // console.log(req.files);

  // This first checks to see if any files (images) were uploaded
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) This function is used to process the 'imageCover'

  // This variable is for the imageCover filename
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  // This uses the 'sharp' NPM Package to resize (or process) the image
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);


  // 2) This function is used to process the 'other images' (in a loop)

  // This variable creates an empty array for the images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      // This variable is used to create the current file name
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      // This uses the 'sharp' NPM Package to resize (or process) the images
      await sharp(file.buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${filename}`);

      // This variable 'pushes' each file into the empty array
      req.body.images.push(filename);
    })
  );

  // This is used to check the 'body' of the tour Object
  console.log(req.body)

  next();
});

// This function 'GETS' the 'top 5 Tours' in this app
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,difficulty';

  next();
};

// This is the new handler function that 'GETS' ALL Tours
exports.getAllTours = factory.getAll(Tour);

// This is the new handler function that 'GETS' ONE Tour
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

// This is the new handler function that 'CREATES' ONE Tour
exports.createTour = factory.createOne(Tour);

// This is the new handler function that 'UPDATES' ONE Tour
exports.updateTour = factory.updateOne(Tour);

// This is the new handler function that 'DELETES' ONE Tour
exports.deleteTour = factory.deleteOne(Tour);


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

// ========= START OF THE MONGODB AGGREGATION PIPELINE ========= \\

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          _id:        { $toUpper: '$difficulty'},
          numTours:   { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating:  { $avg: '$ratingsAverage' },
          avgPrice:   { $avg: '$price' },
          minPrice:   { $min: '$price' },
          maxPrice:   { $max: '$price' },
        }
      },
      {
        $sort: {
          avgPrice: 1
        }
      }
      //  FOR TESTING MULTIPLE MATCHES
      // {
      //   $match: { _id: { $ne: 'EASY' } }
      // }
    ]);

    // This is the success status and response code
    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    // This variable sets the 'year' property
    const year = req.params.year * 1;

    // This variable will use the 'Aggreage Pipeline' to determine the plans
    const plan = await Tour.aggregate([
      {
          $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            // This selects a date range
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' }
        }
      },
      {
        $addFields: { month: '$_id' }
      },
      {
        $project: {
          _id: 0
        }
      },
      {
          $sort: { numTourStarts: -1 }
      },
      //  FOR TESTING MULTIPLE MATCHES
      {
        $limit: 12
      }
    ]);

    // This is the success status and response code
    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
});

// ========= END OF THE MONGODB AGGREGATION PIPELINE ========= \\

// ========= START OF GEOSPACIAL' QUERIES  ========= \\

exports.getToursWithin = catchAsync(async (req, res, next) => {
  // This variable gets all the data from the parameters needed
  const { distance, latlng, unit } = req.params;

  // This variable gets the lat and long coordinates
  const [ lat, lng] = latlng.split(',');

  // This variable defines the radius as read by MongoDb (measured in either miles or kilometers)
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  // This checks to see if a latlng is present
  if (!lat || !lng) {
    next(new AppError('Please provide a latitude and longitude inthe "lat, lng" format', 400));
  }

   // This for checking the latlng formatting
   // console.log(distance, lat, lng, unit);

  // This variable is the start of the query
  const tours = await Tour.find(
    { startLocation: {
        $geoWithin: {
          $centerSphere: [
            [ lng, lat ], radius
          ]
        }
      }
    }
  );

   res.status(200).json({
     status: 'success',
     results: tours.length,
     data:  {
       data: tours
     }
   });
});

// ========= END OF GEOSPACIAL' QUERIES  ========= \\

// ===== START OF 'GEOSPACIAL' AGGREGATION ===== //

exports.getDistances = catchAsync(async (req, res, next) => {
  // This variable gets all the data from the parameters needed
  const { latlng, unit } = req.params;

  // This variable gets the lat and long coordinates
  const [ lat, lng] = latlng.split(',');

  // This variable is used to calculate either miles or kilometers
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  // This checks to see if a latlng is present
  if (!lat || !lng) {
    next(new AppError('Please provide a latitude and longitude inthe "lat, lng" format', 400));
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [ lng * 1, lat * 1 ]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data:  {
      data: distances
    }
  });
});

// ===== END OF 'GEOSPACIAL' AGGREGATION ===== //
