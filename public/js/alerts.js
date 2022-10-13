// This function hides or removes the 'success' or 'error' messages upon login (CAN BE USED TO PERFORM OTHER MESSAGES AS WELL)
export const hideAlert = () => {
  const el = document.querySelector('.alert');

  if (el) el.parentElement.removeChild(el);
};

// This function either shows 'success' or 'error' messages upon login (CAN BE USED TO PERFORM OTHER MESSAGES AS WELL)
export const showAlert = (type, msg) => {
  // This hides any currently showing alerts
  hideAlert();

  const markup = `<div class="alert alert--${type}">${msg}</div>`;

  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);

  // This hides the alerts after 5000ms
  window.setTimeout(hideAlert, 5000);
}
