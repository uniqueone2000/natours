// This brings in the 'Stripe' NPM package
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// This variable imports the 'Tour' model
const Tour = require('../models/tourModel');

// This variable imports the 'Booking' model
const Booking = require('../models/bookingModel');

// This variable imports the 'catchAsync' "Error Handler" function
const catchAsync = require('../utils/catchAsync');

// This brings in the 'Handler Factory' function that handles the handler functions
const factory = require('./handlerFactory');

// This function creates a 'checkout session' for the client
exports.getCheckoutSession = catchAsync(async (req, res, next) => {

  // This variable is used to find the current tourID
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create a checkout session
  const session = await stripe.checkout.sessions.create({
    // == This is the session information
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    expand: ['line_items'],
    // == This is the product information
    line_items: [
      {
        quantity: 1,
        price_data: {
          unit_amount: tour.price * 100,
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: `${tour.summary}`,
          }
        }
      }
    ],
    metadata: {
      name: `${tour.name}`,
      description: `${tour.summary}`,
      images: `https://www.natours.dev/img/tours/${tour.imageCover}`
    },
    mode: 'payment',
  });

  // 3) Create the checkout session response to the client
  res.status(200).json({
    status: 'success',
    session
      // "session": {
      //   "id": "cs_test_a1tG43ljfoYHUczcBy4ThWeadfadfafdafdafda",
      //   "object": "checkout.session",
      //   "after_expiration": null,
      //   "allow_promotion_codes": null,
      //   "amount_subtotal": 497,
      //   "amount_total": 497,
      //   "automatic_tax": {
      //       "enabled": false,
      //       "status": null
      //   },
      //   "billing_address_collection": null,
      //   "cancel_url": "http://127.0.0.1:3000/tour/the-sea-explorer",
      //   "client_reference_id": "5c88fa8cf4afda39709c2955",
      //   "consent": null,
      //   "consent_collection": null,
      //   "currency": "usd",
      //   "customer": null,
      //   "customer_details": {
      //       "email": "isabel@example.com",
      //       "phone": null,
      //       "tax_exempt": "none",
      //       "tax_ids": null
      //   },
      //   "customer_email": "isabel@example.com",
      //   "expires_at": 1640496511,
      //   "livemode": false,
      //   "locale": null,
      //   "metadata": {},
      //   "mode": "payment",
      //   "payment_intent": "pi_3KASnzEcQBB3cSJY07dyL9XD",
      //   "payment_method_options": {},
      //   "payment_method_types": [
      //       "card"
      //   ],
      //   "payment_status": "unpaid",
      //   "phone_number_collection": {
      //       "enabled": false
      //   },
      //   "recovered_from": null,
      //   "setup_intent": null,
      //   "shipping": null,
      //   "shipping_address_collection": null,
      //   "shipping_options": [],
      //   "shipping_rate": null,
      //   "status": "open",
      //   "submit_type": null,
      //   "subscription": null,
      //   "success_url": "http://127.0.0.1:3000/",
      //   "total_details": {
      //       "amount_discount": 0,
      //       "amount_shipping": 0,
      //       "amount_tax": 0
      //   },
      //   "url": "edited to hide test keys"
      // }
  });
});

// This function is used to create a new 'Booking' Checkout  in the database
exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // === The following steps are temporary until this application goes live AND VERY UNSECURE <------

  const { tour, user, price } = req.query;

  // This checks for the three variables above to create a booking
  if (!tour && !user && !price) {return next()};

  // This creates the 'Booking' with all the variables listed (as they are required to complete a booking)
  await Booking.create({ tour, user, price });

  // This redirects the user to the 'Overview' page after a booking is made (for this application)
  res.redirect(req.originalUrl.split('?')[0]);
});

// This function is used to create a new 'Booking'
exports.createBooking = factory.createOne(Booking);

// This function is used to 'GET' a 'Booking' from the database
exports.getBooking = factory.getOne(Booking);

// This function is used to 'GET ALL' 'Bookings' from the database
exports.getAllBookings = factory.getAll(Booking);

// This function is used to 'UPDATE' a 'Booking'
exports.updateBooking = factory.updateOne(Booking);

// This function is used to 'DELETE' a 'Booking'
exports.deleteBooking = factory.deleteOne(Booking);
