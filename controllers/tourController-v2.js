
// This imports the 'Tour' model
const Tour = require('./../models/tourModel');

// This function 'GETS' the 'top 5 Tours' in this app
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,difficulty';

  next();
};

// const  fs = require('fs');

// This function 'GETS' all the Tours in this app
exports.getAllTours = async (req, res) => {
  try {

    // TO BUILD A QUERY...

    // === FOR TESTING THE QUERY ==== //
    // console.log(req.query, queryObj);

    // ========= FILTERING OPERATIONS START ========= \\

    // ---> 1) Basic Filtering
    // This variable creates an object for the "key/value" pairs for a Tour filter
    const queryObj = { ...req.query };

    // This variable creates an array of all the fields that we want to exclude from the filter
    const excludeFields = [ 'page', 'sort', 'limit', 'fields' ];

    // This foreach loop removes the excluded fields from the filter
    excludeFields
      .forEach(el => delete queryObj[el]);

    // ---> 2) Advanced Filtering

    // This variable converts the base filter (below) into a string
    let queryStr = JSON.stringify(queryObj);

    // This uses a 'Regular Expression' to get the exact match for the 'MongoDb Operators'
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // === FOR TESTING THE ADVANCED FILTER QUERY STRING ==== //
    // console.log(JSON.parse(queryStr));

    // This query is used as an Advanced Filter for the Tours
    let query = Tour.find(JSON.parse(queryStr));

    // ========= FILTERING OPERATIONS END  ========= \\

    // ========= SORTING OPERATIONS START ========= \\

    // This checks if a 'Sort' query has been initiated
    if (req.query.sort) {
      // To sort by multiple parameters:
      const sortBy = req.query.sort.split(',').join(' ');

      // === FOR TESTING THE ADVANCED SORT QUERY STRING ==== //
      // console.log(sortBy);

      // This query is used as an Advanced Sort Query for the Tours
      query = query.sort(sortBy);
    } else {
      // This is the 'DEFAULT' query which chooses the 'createdAt'key (field) for sorting (for this app only)
      query = query.sort('-createdAt');
    }

    // ========= SORTING OPERATIONS END  ========= \\

    // ========= LIMIT OPERATIONS START ========= \\

    // This checks if a 'Limiting' query has been initiated
    if (req.query.fields) {
      // To filter by multiple parameters:
      const fields = req.query.fields.split(',').join(' ');

      // This query is used as an Advanced Filter Query for the Tours
      query = query.select(fields);
    } else {
      // This is the 'DEFAULT' query which chooses the '__v' key (field) for sorting (for this app only)
      query = query.select('-__v');
    }

    // ========= LIMIT OPERATIONS END ========= \\

    // ========= PAGINATION OPERATIONS START ========= \\

    // This variable gets the first page in the results query of all the Tours
    const page = req.query.page * 1 || 1;

    // This variable sets the 'default' limit for the pagination query (to 100 for this app)
    const limit = req.query.limit * 1 || 100;

    // This variable calculates the 'skip' limit
    const skip = (page -1) * limit;

    query = query.skip(skip).limit(limit);

    // This is used to check if the skip limit is more than the objects in the Tours model
    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist');
    }

    // ========= PAGINATION OPERATIONS END ========= \\

    // THIS IS USED TO EXECUTE THE QUERIES LISTED ABOVE...
    // This is the result of the query
    const tours = await query;

    // This is the SUCCESS RESPONSE code
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (err) {
    // This is the ERROR RESPONSE code
    res.status(404).json({
      status: 'failed',
      message: err
    });
  }
};

// This function 'GETS ONE' Tour in this app
exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)

    // This is the success status and response code
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    // This is the error status and response code
    res.status(404).json({
      status: 'failed',
      message: err
    });
  }
};

// This function 'CREATES' a Tour
exports.createTour = async (req, res) => {

  // This creates a new 'Tour' from the model
  try {
    const newTour = await Tour
    .create(req.body);

    // This is the success status and response code
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });

  } catch (err) {
    // This is the error status and response code
    res.status(400).json({
      status: 'failed',
      message: err
    });
  }
};

// This function 'UPDATES' a Tour
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }
  );

    // This is the success status and response code
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err ) {
    // This is the error status and response code
    res.status(400).json({
      status: 'failed',
      message: err
    });
  }
};

// This function 'DELETES' a Tour
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    // This is the success status and response code
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err ) {
    // This is the error status and response code
    res.status(400).json({
      status: 'failed',
      message: err
    });
  }
};
