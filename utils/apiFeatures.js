// This Class contains a method for each of the API Operators
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // ========= FILTERING OPERATIONS START ========= \\
  filter() {
    // TO BUILD A QUERY...

    // // ---> 1) Basic Filtering
    // This variable creates an object for the "key/value" pairs for a Tour filter
    const queryObj = { ...this.queryString };

    // This variable creates an array of all the fields that we want to exclude from the filter
    const excludedFields = [ 'page', 'sort', 'limit', 'fields' ];

    // This foreach loop removes the excluded fields from the filter
    excludedFields.forEach(el => delete queryObj[el]);

    // ---> 2) Advanced Filtering

    // This variable converts the base filter (below) into a string
    let queryStr = JSON.stringify(queryObj);

    // This uses a 'Regular Expression' to get the exact match for the 'MongoDb Operators'
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // === FOR TESTING THE ADVANCED FILTER QUERY STRING ==== //
    // console.log(JSON.parse(queryStr));

    // This query is used as an Advanced Filter for the Tours
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }
  // ========= FILTERING OPERATIONS END  ========= \\

  // ========= SORTING OPERATIONS START ========= \\
  sort() {
    // This checks if a 'Sort' query has been initiated
    if (this.queryString.sort) {
      // To sort by multiple parameters:
      const sortBy = this.queryString.sort.split(',').join(' ');

      // === FOR TESTING THE ADVANCED SORT QUERY STRING ==== //
      // console.log(sortBy);

      // This query is used as an Advanced Sort Query for the Tours
      this.query = this.query.sort(sortBy);
    } else {
      // This is the 'DEFAULT' query which chooses the 'createdAt'key (field) for sorting (for this app only)
      this.query = this.query.sort('-createdAt');
    }

    return this;

  }

  // ========= SORTING OPERATIONS END  ========= \\

  // ========= LIMIT OPERATIONS START ========= \\
  limitFields() {

    // This checks if a 'Limiting' query has been initiated
    if (this.queryString.fields) {
      // To filter by multiple parameters:
      const fields = this.queryString.fields.split(',').join(' ');

      // This query is used as an Advanced Filter Query for the Tours
      this.query = this.query.select(fields);
    } else {
      // This is the 'DEFAULT' query which chooses the '__v' key (field) for sorting (for this app only)
      this.query = this.query.select('-__v');
    }

    return this;
  }

  // ========= LIMIT OPERATIONS END ========= \\

  // ========= PAGINATION OPERATIONS START ========= \\
  paginate() {

    // This variable gets the first page in the results query of all the Tours
    const page = this.queryString.page * 1 || 1;

    // This variable sets the 'default' limit for the pagination query (to 100 for this app)
    const limit = this.queryString.limit * 1 || 100;

    // This variable calculates the 'skip' limit
    const skip = (page -1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  // ========= PAGINATION OPERATIONS END ========= \\
};

// ========= END OF API FEATURES ========= \\

module.exports = APIFeatures;
