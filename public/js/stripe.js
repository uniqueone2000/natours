// this brings in the 'Axios' NPM package
import axios from 'axios';

// This brings in the 'StripeJs' NPM package
// import { loadStripe } from '@stripe/stripe-js'

// This brings in the 'Stripe' NPM package
const stripe = require('stripe');

// This brings in the 'Alert' function from 'alert.js'
import { showAlert } from './alerts';


export const bookTour = async (tourId) => {

  // This variable is for the 'Stripe' public apikey

  try {
    const stripe = Stripe('pk_test_51LpgUaCU4aYEnFuOQOVX6lx1cksLS3mB6rXYLshqrNxenEIFiDZckiiinktrQbBWraWvtxPcxHpS0oQRYPyRDWE400pXvLBq9X');

    // 1) Get the 'checkout session' from the API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // This is used to take a look at the session
    console.log(session);

    // 2) Create the Stripe checkout form and process the credit card
    return await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }



};
