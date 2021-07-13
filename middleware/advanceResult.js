const advanceResult = (model, populate) => async (req, res, next) => {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query }

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    //Loop over removeFields and delete them from reqQuery
    removeFields.forEach(params => delete reqQuery[params]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create Operators ($gt, $gte, etc) 
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resouces
    query = model.find(JSON.parse(queryStr));

    // Select Fields
    if(req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields)
    }

    // Sort 
    if(req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy)
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const skip = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();

    query = query.skip(skip).limit(limit)

    if(populate) {
        query = query.populate(populate);
    }

    // executing query
    const result = await query;

    // Pagination result
    const pagination = {}

    if(endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit 
        }
    }

    if(startIndex > 0) {
        pagination.prev = {
            page : page - 1,
            limit
        }
    }

    res.advanceResult = {
        success : true,
        count : result.length,
        pagination,
        data : result
    }

    next();
}

module.exports = advanceResult