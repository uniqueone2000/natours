// This brings in the 'Axios' NPM package
import axios from 'axios';

// This brings in the 'Alert' javascript function
import { showAlert } from './alerts';

// This is the 'login' function for the 'login' form
export const updateSettings = async (data, type) => {

  // This is is used to set the url if the user wants to either change their password or other user account data
  try {
    const url = type === 'password' ? '/api/v1/users/updateMyPassword' : '/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data
    });

    // This is used to check if the 'API Call' to the database succeded
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} User data updated Succussfully!!!`);
    }

    // This is used to check the result of this function
    // console.log(res);

  } catch (err) {
    // This is used to check the error response of this function
    // console.log(err.response.data);
    showAlert('error', err.response.data.message);
  }
};
