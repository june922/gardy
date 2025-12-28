class SearchBuilder {
  constructor(model) {
    this.model = model;
    this.query = model.query();
    this.filters = [];
  }

  addFilter(field, value, operator = '=') {
    if (value !== undefined && value !== null && value !== '') {
      this.filters.push({ field, value, operator });
    }
    return this;
  }

  addLikeFilter(field, value) {
    if (value) {
      this.filters.push({ field, value, operator: 'like' });
    }
    return this;
  }

  addDateRangeFilter(field, fromDate, toDate) {
    if (fromDate) {
      this.filters.push({ field, value: fromDate, operator: '>=' });
    }
    if (toDate) {
      this.filters.push({ field, value: toDate, operator: '<=' });
    }
    return this;
  }

  build(page = 1, limit = 10) {
    // Apply filters
    this.filters.forEach(filter => {
      if (filter.operator === 'like') {
        this.query.where(filter.field, 'like', `%${filter.value}%`);
      } else {
        this.query.where(filter.field, filter.operator, filter.value);
      }
    });

    // Apply pagination
    const offset = (page - 1) * limit;
    return this.query
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc');
  }

  async execute(page = 1, limit = 10) {
    const query = this.build(page, limit);
    const results = await query;
    const total = await this.model.query().where(builder => {
      this.filters.forEach(filter => {
        if (filter.operator === 'like') {
          builder.where(filter.field, 'like', `%${filter.value}%`);
        } else {
          builder.where(filter.field, filter.operator, filter.value);
        }
      });
    }).resultSize();
    
    return {
      data: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

// Example search function for users
const searchUsers = async (req, res) => {
  try {
    const { 
      first_name, 
      last_name, 
      user_email, 
      phone_number,
      user_type_id,
      page = 1, 
      limit = 10 
    } = req.query;

    const User = require('../api/users/users.model');
    const searchBuilder = new SearchBuilder(User);
    
    searchBuilder
      .addLikeFilter('first_name', first_name)
      .addLikeFilter('last_name', last_name)
      .addLikeFilter('user_email', user_email)
      .addLikeFilter('phone_number', phone_number)
      .addFilter('user_type_id', user_type_id);

    const result = await searchBuilder.execute(page, limit);
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).send({ message: "Error performing search" });
  }
};

// Example search function for vehicles
const searchVehicles = async (req, res) => {
  try {
    const { 
      plate_number, 
      owner_name,
      vehicle_type_id,
      estate_id,
      page = 1, 
      limit = 10 
    } = req.query;

    const Vehicle = require('../api/vehicles/vehicles.model');
    const searchBuilder = new SearchBuilder(Vehicle);
    
    searchBuilder
      .addLikeFilter('plate_number', plate_number)
      .addLikeFilter('owner_name', owner_name)
      .addFilter('vehicle_type_id', vehicle_type_id)
      .addFilter('estate_id', estate_id);

    const result = await searchBuilder.execute(page, limit);
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).send({ message: "Error performing search" });
  }
};

module.exports = {
  SearchBuilder,
  searchUsers,
  searchVehicles
};