const fs = require('fs');

// ENVIRONMENT VARIABLES
const dotenv = require('dotenv');

// This is for the "Environment Variables" path
dotenv.config({ path: './config.env' });

// This brings in the 'Tour' model so we can write to it
const Tour = require('./../../models/tourModel');

// This brings in the 'User' model so we can write to it
const User = require('./../../models/userModel');

// This brings in the 'Review' model so we can write to it
const Review = require('./../../models/reviewModel');

// This variable pulls in the "mongoose" npm package
const mongoose = require('mongoose');

// This variable pulls in the database from our 'config.env' file
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// This is the "mongoose" configuration for our database
mongoose.connect(DB, {
  useNewUrlParser    : true,
  useUnifiedTopology : true
  // These options are no longer supported (they were part of the video instructions)
  // useCreateIndex     : true,
  // useFindAndModify   : false,
}).then(con => {
  //  For Testing: console.log(con.connections);
  console.log('DB connection successful');
});

// This variable is used to READ dataa the 'JSON' files to import resourses (from the course)
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

// This function imports the data into the database
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data successfully loaded!!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// This deletes all previous data in the database
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted!!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// This statement is used to help us choose whether we want to import or delete the data in the database
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// This is for you to use as a CLI Command
// +*+ node dev-data/data/import-dev-data.js --
