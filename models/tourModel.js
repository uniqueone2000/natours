// This variable pulls in the "mongoose" npm package
const mongoose = require('mongoose');

// This variable pulls in the 'slugify' npm package
const slugify = require('slugify');

// This variable brings in the 'Users' model
// const User = require('./userModel');

// This variable pulls in the "validator" npm package
const validator = require('validator');

// This is the Schema used to create a 'Tour'
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [
      true, 'A tour must have a name',
    ],
    unique: true,
    trim: true,
    maxlength: [
      40, 'A Tour name can contain no more than 40 characters'
    ],
    minlength: [
      10, 'A Tour name can contain no less than 40 characters'
    ]
  },
  slug: String,
  duration: {
    type: Number,
    required: [ true, 'A tour must have a duration' ]
  },
  maxGroupSize: {
    type: Number,
    refquired: [ true, 'A tour must have a group size' ]
  },
  difficulty: {
    type: String,
    required: [ true, 'A tour must have a difficulty' ],
    enum: {
      values: [ 'easy', 'medium', 'difficult' ],
      message: 'Difficulty can be eithe: easy, medium or difficult'
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [ 1, 'A Tour rating can be no less than 1' ],
    max: [ 5, 'A Tour rating can be no greater than 5' ],
    set: val => Math.round(val * 10) / 10
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [ true, 'A tour must have a price' ]
  },
  priceDiscount: {
    type: String,
    // This is a custom validator that checks if the discount is actually lower than the price
    validate: {
      validator: function(val) {
        // This only works for "new" tours (not updating one)
        return val < this.price;
      },
      message: 'Discount price should be below Regular Price'
    }
},
  summary: {
    type: String,
    trim: true,
    required: [ true, 'A tour must have a summary' ]
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [ true, 'A tour must have a cover image' ]
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false
  },
  // == Start of GeoJSON Data === //
  startLocation: {
    type: {
      type: String,
      default: 'Point',
      enum: {
        values: ['Point']
      }
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: {
          values: ['Point']
        }
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number
    }
  ],
  // == End of GeoJSON Data === //

  // == Start of 'Embeding' Documents == //
  // guides: Array
  // == End of 'Embeding' Documents === //

  // == Start of 'Referencing' Documents == //
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ]
  // == End of 'Embeding' Documents === //

}, // === End of the Orignal Schema === //
// These are the 'Schema Options' (usually used with 'Virtual Properies')
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
}
);

// ==== START OF MONGODb INDEXING ==== //

// This is the tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });

// This is the 'slug' index
tourSchema.index({ slug: 1 });

// This is the startLocation index
tourSchema.index({ startLocation: '2dsphere' });

// ==== END OF MONGODb INDEXING ==== //


// ==== START OF VIRTUAL PROPERTIES ==== //

// This 'Virtual Property' gets the number of days a Tour would last
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7
});

// This 'Virtual Populate' query links the tours and review models to build a review
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// ==== END OF VIRTUAL PROPERTIES ==== //

// ==== START OF MONGOOSE DOCUMENT MIDDLEWARE ==== //

// This is for 'PRE' middleware function to be called 'BEFORE' a document is saved or created (and NOT for "updates")
tourSchema.pre('save', function(next) {
  // This is for testing
  // console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

// === START OF EMBEDDING DOCUMENTS (only used to CREATE New Documents) >>> USED AS AN EXAMPLE. KEEP HERE FOR A REFERENCE!!! <<<

  // This is used to 'EMBED' parts of the 'Users' model with this model
// tourSchema.pre('save', async function(next) {
//
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//
//   this.guides = await Promise.all(guidesPromises);
//
//   next();
// });

// === END OF EMBEDDING DOCUMENTS

// ==== END OF MONGOOSE DOCUMENT MIDDLEWARE ==== //

// ==== START OF MONGOOSE QUERY MIDDLEWARE ==== //

// This is a 'PRE' find query

// This only handles the "find" query
// tourSchema.pre('find', function(next) {

// This uses a 'Reqular Expression' to filter all the 'find' command options
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });

  // THIS IS FOR TESTING
  // This sets a timer to determine how long it took for this query to run "Start Time"
  // this.start = Date.now();

  next();
});

// This populates the 'guides' fields with their referenced data (from the 'User' schema)
tourSchema.pre(/^find/, function(next) {
  this.populate({
    // This helps to 'OMIT' fields that we don't want to be seen on the client side
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
});

// This is a 'POST' find query
tourSchema.post(/^find/, function(docs, next) {
  // THIS IS FOR TESTING
  // This sets a timer to determine how long it took for this query to run "Start Time"
  // console.log(`This query took ${Date.now() - this.start} milliseconds!`);

  // console.log(docs);
  next();
});


// ==== END OF MONGOOSE QUERY MIDDLEWARE ==== //

// ==== START OF MONGOOSE AGGREGATION MIDDLEWARE ==== //

// This is a 'PRE' aggregation query
// >>> COMMENTED OUT FOR THE PURPOSES OF ALLOWING THE 'GEONEAR' AGGREGATION QUERY TO RUN FIRST <<<

// tourSchema.pre('aggregate', function(next) {
//   // This fiters out the 'secretTour' and removes them from tours query
//   this.pipeline()
//     .unshift(
//       { $match: { secretTour: { $ne: true } } });
//
//   // This is for testing
//   console.log(this.pipeline());
//   next();
// });

// ==== END OF MONGOOSE AGGREGATION MIDDLEWARE ==== //


// This creates the 'Tour' model from the Schema (above)
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
