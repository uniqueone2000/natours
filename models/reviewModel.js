// This variable brings in the "crypto" node package
const crypto = require('crypto');

// This variable brings in the "mongoose" npm package
const mongoose = require('mongoose');

// This variable pulls in the "validator" npm package
const validator = require('validator');

// This brings in the 'bcrypt' npm package
const bcrypt = require('bcryptjs');

// This brings in the 'Tour' Model
const Tour = require('./tourModel');

// This is the Schema used to create a 'Review'
const reviewSchema = new mongoose.Schema({
  review: {
      type: String,
      trim: true,
      required: [true, 'A review cannot be left blank']
  },
  rating: {
      type: Number,
      trim: true,
      min: 1,
      max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    // select: false
  },
  tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Each tour must have a Review.']
  },
  user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Each review must belong to a User']
  }
},// === End of the Orignal Schema === //
// These are the 'Schema Options' (usually used with 'Virtual Properies')
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
}
);

// This creates a 'Compound Index' on the tour reviews
reviewSchema.index({ tour: 1, user: 1}, { unique: true });

// This function 'finds' all the tours and the related users that have reviewed them
reviewSchema.pre(/^find/, function(next) {
  // Kept here as an Example
  // // This part gets the tour name
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // }).populate({
  //   // This part gets the user
  //   path: 'user',
  //   select: 'name photo'
  // });

  this.populate({
    // This part gets the user
    path: 'user',
    select: 'name photo'
  });

  next();
});

// This function implements is a 'STATIC' Method that will help calculate the average rating and number of ratings of a tour
reviewSchema.statics.calcAverageRatings = async function(tourId) {

  // This is done using the MongoDb 'AGGREGATION PIPELINE'
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  // This is for testing the calculation above
  // console.log(stats);

  // This matches the name in the pipeline above to the acutal fields in the Tour Schema
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

// This middleware function calls the 'stats' variable to actually persist the statistics to the database upon creating a review
reviewSchema.post('save', function() {
  // The 'this' keyword here points to the current review
  this.constructor.calcAverageRatings(this.tour);
});

// This middleware function will be used to update or delete a Tour Review. It is a query function that will actually persist the statistics to the database upon updating or deleting a review
reviewSchema.post(/^findOneAnd/, async function(doc) {
  await doc.constructor.calcAverageRatings(doc.tour);
});



// This creates the 'Review' model from the Schema
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
