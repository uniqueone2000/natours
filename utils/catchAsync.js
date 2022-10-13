// This function is used to managae the "try / catch" portion of the "async / await" block
module.exports = fn => {

  return (req, res, next) => {
    // The 'catch' block is the 'promise' object of this function which contains the error code
    fn(req, res, next).catch(next);
  };
};
