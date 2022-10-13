// ENVIRONMENT VARIABLES
const dotenv = require('dotenv');

///// **** START OF 'UNCAUGHT EXCEPTION' ERROR HANDLING **** /////

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION!!! Shutting DOWN the SERVER!!!!!');

  // This is for testing
  console.log(err.name, err.message);

});

///// **** END OF 'UNCAUGHT EXCEPTION' ERROR HANDLING **** /////

// This is for the "Environment Variables" path
dotenv.config({ path: './config.env' });

// This variable pulls in the "mongoose" npm package
const mongoose = require('mongoose');

// This is the listening port of the server (development only)
const PORT = process.env.PORT || 3000;

// This variable starts the application
const app = require('./app');

// This variable pulls in the database from our 'config.env' file
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// This is the "mongoose" configuration for our database
mongoose.connect(DB, {
  useNewUrlParser    : true,
  // useCreateIndex     : true,
  // useFindAndModify   : false,
  useUnifiedTopology : true
}).then(con => {
  //  For Testing the Databasse connection: console.log(con.connections);
  console.log('DB connection successful');
});

// This is the Server's "LISTENING" function
const server = app.listen(PORT, (req, res) => {
  console.log(`App running on port: ${PORT}...`);
});

///// ===== START OF 'UNHANDLED REJECTION' ERROR HANDLING ===== /////

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION!!! Shutting DOWN the SERVER!!!!!');

  // This is for testing
  console.log(err.name, err.message);

  // This shuts down the application
  server.close(() => {
    process.exit(1);
  });
});

///// ===== END OF 'UNHANDLED REJECTION' ERROR HANDLING ===== /////
