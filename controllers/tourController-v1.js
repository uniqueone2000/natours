const  fs = require('fs');

// This is the "Tours" data source
const tours = JSON.parse( fs.readFileSync (`${__dirname}/../dev-data/data/tours-simple.json`) );

// This "Middleware" function checks for an "id" when looking up a specific tour
exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);

  if(req.params.id * 1 > tours.length) {
    return res.status(404).json({
        status: 'fail',
        message: 'Invalid Tour Id'
    });
  };
  next();
};

// This Middleware function checks the 'req.body'
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price'
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
};

exports.getTour = (req, res) => {
  // This is for testing the route parameters
  // console.log(req.params);

  // This will convert the "id" of the tour into a number (which is currently a string)
  const id = req.params.id * 1;

  // TOUR SOLUTION #1:
  // This solution checks the requested tour id against the number of tours in the file

  // if(id > tours.length) {
  //   return res.status(404).json({
  //       status: 'fail',
  //       message: 'Invalid Tour Id'
  //   });
  // };

  // TOUR SOLUTION #2:
  // This solution checks the requested tour id even exists in the tours file
  if(!tour) {
    return res.status(404).json({
        status: 'fail',
        message: 'Invalid Tour Id'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
};

exports.createTour = (req, res) => {
  // This just displays the data from the "body" of the request
  // console.log(req.body);

  // This is for testing. We can use this to add new tours until we create a database
  const newId = tours[tours.length - 1].id + 1;
  // console.log(newId);
  const newTour = Object.assign({ id: newId }, req.body);
  //
  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours),
    err => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });
    }
  );
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated Tour Here...>'
    }
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null
  });
};
