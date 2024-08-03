const visitors = require('./visitors.model');
const users = require('./visitors.model');
const { patch } = require('./visitors.routes');

// Create visitor
const createVisitors = async (req, res) => {
  const { first_name, last_name, national_id, phone_number, house_number } = req.body;
  const requiredAttributes = ['first_name', 'last_name', 'national_id', 'phone_number', 'house_number'];
  const missingAttributes = requiredAttributes.filter(attr => !req.body[attr]);

  if (missingAttributes.length > 0) {
    return res.status(400).json({
      "Missing attributes": missingAttributes.join(', ')
    });
  }

  try {
    const newVisitor = await visitors.query().insert({ first_name, last_name, national_id, phone_number, house_number });
    res.status(201).json({
      message: "Vistor Added Successfully.",
      data: {
        first_name: newVisitor.first_name,
        last_name: newVisitor.last_name,
        national_id: newVisitor.national_id,
        phone_number: newVisitor.phone_number,
        house_number: newVisitor.house_number
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating visitor: ' + error.message);
  }
};

// // Update personal details
// const updatePersonalDetails = async (req, res) => {
//   const { usersid } = req.params;
//   const editables = ["phone_number", "house_number", "resident_estate", "city_id", "user_email"];
  
//   const invalidKeys = Object.keys(req.body).filter(key => !editables.includes(key));
//   if (invalidKeys.length > 0) {
//     return res.status(400).json({ error: `Not allowed: ${invalidKeys.join(', ')}` });
//   }

//   const updates = {};
//   for (const key of Object.keys(req.body)) {
//     if (req.body[key]) {
//       updates[key] = req.body[key];
//     }
//   }

//   if (Object.keys(updates).length === 0) {
//     return res.status(400).json({ error: 'No valid updates provided' });
//   }

//   if ('phone_number' in req.body && req.body.phone_number !== "") {
//     if (!validatePhoneNumber(req.body.phone_number)) {
//       return res.status(400).json({ error: 'Invalid phone number format!' });
//     }
//   }

//   if (req.body.user_email) {
//     const userEmailExists = await users.query().where({ user_email: req.body.user_email }).first();
//     if (userEmailExists) {
//       return res.status(400).json({ message: "Failed! UserEmail already taken!" });
//     }
//   }

//   if ('city_id' in req.body && req.body.city_id !== "") {
//     const cityExists = await City.query().where({ id: req.body.city_id }).first();
//     if (!cityExists) {
//       return res.status(400).json({ message: "Failed! Provided city does not exist!" });
//     }
//   }

//   try {
//     const userExists = await users.query().where({ id: usersid }).first();
//     if (!userExists) {
//       return res.status(404).json({ message: "Failed! User does not exist!" });
//     }

//     await users.query().patch(updates).where({ id: usersid });
//     res.status(200).json({ message: "User updated successfully!" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// function validatePhoneNumber(phoneNumber) {
//   const phoneRegex = /^[0-9]{10}$/;
//   return phoneRegex.test(phoneNumber);
// }

// Get visitor details by ID
const getVisitorsDetailsById = async (req, res) => {
  const { visitorsid } = req.params;

  try {
    const visitor = await visitors.query().findById(visitorsid);

    if (!visitor) {
      return res.status(404).json({ error: 'Visitor not found' });
    }

    const keysToRemove = [ 'created_at', 'updated_at'];
    const filteredVisitor = Object.keys(visitor).reduce((acc, key) => {
      if (!keysToRemove.includes(key)) {
        acc[key] = visitor[key];
      }
      return acc;
    }, {});

    res.status(200).json(filteredVisitor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get all users
const getAllVisitors = async (req, res) => {
  try {
    const allVisitors = await visitors.query();
    res.status(200).json(allVisitors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

//Delete user
const deleteVisitorsById = async (req, res) => {
  const { visitorsid } = req.params;

  try {
    // Check if the user exists
    const visitor = await visitors.query().findById(visitorsid);
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    // Delete the user
    await visitors.query().deleteById(visitorsid);

    res.status(200).json({ message: "Visitor deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createVisitors,
  getVisitorsDetailsById,
  getAllVisitors,
  deleteVisitorsById
};
