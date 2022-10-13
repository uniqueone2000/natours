// This brings in the 'Axios' NPM package
import axios from 'axios';

// This brings in the 'Alert' javascript function
import { showAlert } from './alerts';

// This is the 'login' function for the 'login' form
export const login = async (email, password) => {

  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
        withCredentials: true
      }
    });

    // This is used to check if the 'API Call' to the database succeded
    if (res.data.status === 'success') {
      showAlert('success', 'Logged In Succussfully...');

      // This loads the main page after 1500ms
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }

    // This is used to check the result of this function
    // console.log(res);

  } catch (err) {
    // This is used to check the error response of this function
    // console.log(err.response.data);
    showAlert('error', err.response.data.message);
  }
};

// This is the 'log out' function for the application
export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });

    // This checks if the 'logout' was successful
    if ((res.data.status = 'success'))
      // This redirects the user to the 'Overview' page
      location.replace('/');
  } catch (err) {
    showAlert('error', 'Error Logging You Out. Please try again');
  }
};
