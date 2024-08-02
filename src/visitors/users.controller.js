const users = require('./users.model');
const City = require('../cities/city.model'); // Ensure to import the City model
const { patch } = require('./users.routes');

// Create user
const createUser = async (req, res) => {
  const { first_name, last_name, user_email, user_password, phone_number, house_number, resident_estate, city_id } = req.body;
  const requiredAttributes = ['first_name', 'last_name', 'user_email', 'user_password', 'phone_number', 'house_number', 'resident_estate', 'city_id'];
  const missingAttributes = requiredAttributes.filter(attr => !req.body[attr]);

  if (missingAttributes.length > 0) {
    return res.status(400).json({
      "Missing attributes": missingAttributes.join(', ')
    });
  }

  try {
    const newUser = await users.query().insert({ first_name, last_name, user_email, user_password, phone_number, house_number, resident_estate, city_id });
    res.status(201).json({
      message: "User Created Successfully.",
      data: {
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        user_email: newUser.user_email,
        phone_number: newUser.phone_number,
        resident_estate: newUser.resident_estate,
        house_number: newUser.house_number,
        city_id: newUser.city_id,
        user_password: user_password,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating user: ' + error.message);
  }
};

// Update personal details
const updatePersonalDetails = async (req, res) => {
  const { usersid } = req.params;
  const editables = ["phone_number", "house_number", "resident_estate", "city_id", "user_email"];
  
  const invalidKeys = Object.keys(req.body).filter(key => !editables.includes(key));
  if (invalidKeys.length > 0) {
    return res.status(400).json({ error: `Not allowed: ${invalidKeys.join(', ')}` });
  }

  const updates = {};
  for (const key of Object.keys(req.body)) {
    if (req.body[key]) {
      updates[key] = req.body[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid updates provided' });
  }

  if ('phone_number' in req.body && req.body.phone_number !== "") {
    if (!validatePhoneNumber(req.body.phone_number)) {
      return res.status(400).json({ error: 'Invalid phone number format!' });
    }
  }

  if (req.body.user_email) {
    const userEmailExists = await users.query().where({ user_email: req.body.user_email }).first();
    if (userEmailExists) {
      return res.status(400).json({ message: "Failed! UserEmail already taken!" });
    }
  }

  if ('city_id' in req.body && req.body.city_id !== "") {
    const cityExists = await City.query().where({ id: req.body.city_id }).first();
    if (!cityExists) {
      return res.status(400).json({ message: "Failed! Provided city does not exist!" });
    }
  }

  try {
    const userExists = await users.query().where({ id: usersid }).first();
    if (!userExists) {
      return res.status(404).json({ message: "Failed! User does not exist!" });
    }

    await users.query().patch(updates).where({ id: usersid });
    res.status(200).json({ message: "User updated successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

function validatePhoneNumber(phoneNumber) {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phoneNumber);
}

// Get personal details by ID
const getPersonalDetailsById = async (req, res) => {
  const { usersid } = req.params;

  try {
    const user = await users.query().findById(usersid);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const keysToRemove = ['user_password', 'created_at', 'updated_at'];
    const filteredUser = Object.keys(user).reduce((acc, key) => {
      if (!keysToRemove.includes(key)) {
        acc[key] = user[key];
      }
      return acc;
    }, {});

    res.status(200).json(filteredUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const allUsers = await users.query();
    res.status(200).json(allUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

//Delete user
const deleteUserById = async (req, res) => {
  const { usersid } = req.params;

  try {
    // Check if the user exists
    const user = await users.query().findById(usersid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user
    await users.query().deleteById(usersid);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createUser,
  updatePersonalDetails,
  getPersonalDetailsById,
  getAllUsers,
  deleteUserById
};
