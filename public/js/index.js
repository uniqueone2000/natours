// This is a 'polyfill' to allow backwards compatability with older browsers
import '@babel/polyfill';

// This brings in the login javascript file
import { displayMap } from './mapbox';

// This brings in the login javascript file
import { login, logout } from './login';

// This brings in the login javascript file
import { updateSettings } from './updateSettings';

// This brings in the 'bookTour' function from the stripe javascript file
import { bookTour } from './stripe';

// ===== START OF DOM ELEMENT SELECTORS ===== //

// DOM Element for 'Mapbox'
const mapBox = document.getElementById('map');

// DOM Element for USer Account Form
const userDataForm = document.querySelector('.form-user-data');

// DOM Element for USer Account Form
const userPasswordForm = document.querySelector('.form-user-password');

// DOM Element for Login Form
const loginForm = document.querySelector('.form--login');

// DOM Element for Log Out button
const logOutBtn = document.querySelector('.nav__el--logout');

 // DOM Element for Book Tour button
const bookBtn = document.getElementById('book-tour');

// ===== END OF DOM ELEMENT SELECTORS ===== //


// This checks to see if a page in the site needs to have a map
if (mapBox) {
  const locations =JSON.parse(mapBox.dataset.locations);

  displayMap(locations);
}

// ===== START OF DOM EVENT LISTENERS ===== //

// This listens for a 'submit' event on the user account form
if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();

    // This variable gathers all the form data to send to the server
    const form = new FormData();
    form.append('name', document.getElementById('name').value)
    form.append('email', document.getElementById('email').value)
    form.append('photo', document.getElementById('photo').files[0])

    // This is used to check that the form values are correct
    console.log(form);

    updateSettings(form, 'data');
  });

  // This listens for a 'submit' event on the user password form
  if (userPasswordForm)
    userPasswordForm.addEventListener('submit', async e => {
      e.preventDefault();

      // This is used to change the button (like a status progress icon) when the user has clicked the 'Save Password' button
      document.querySelector('.btn--save-password').textContent = 'Updating...';

      const passwordCurrent = document.getElementById('password-current').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;

      await updateSettings({passwordCurrent, password, passwordConfirm}, 'password');

      // This is used to change the button (like a status progress icon) AFTER the password has been updated
      document.querySelector('.btn--save-password').textContent = 'Save Password';

      // This clears the newly updated password values from the form after the update
      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';
    });

// This listens for a 'submit' event on the login form
if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });

  // This listens for a 'submit' event on the log out button
  if (logOutBtn) logOutBtn.addEventListener('click', logout);

  // This listens for a 'click' event on the 'Book Tour' button
  if (bookBtn) bookBtn.addEventListener('click', e => {

    // This changes the text of the button while getting the Tour
    e.target.textContent = 'Processing...';

    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });

  // ===== END OF DOM EVENT LISTENERS ===== //
