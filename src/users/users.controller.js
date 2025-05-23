const users = require('./users.model');
const usertypes = require('../usertypes/usertypes.model');
const userroles = require('../userroles/userroles.model');
const useruserroles = require('../useruserroles/useruserroles.model');
const userusertypes = require('../userusertypes/userusertypes.model');
const employees = require('../employees/employees.model');
const estates = require('../estates/estates.model');
const statuses = require('../statuses/statuses.model');
const bcrypt = require('bcrypt');

// Create user
const createUser = async (req, res) => {
  const { first_name, last_name, user_email, user_password, phone_number, national_id, user_type_id, user_role_id,status_id, created_by } = req.body;

  try {
    // Fetch user type to check if email and password are required
    const userType = await usertypes.query().findById(user_type_id);

    if (!userType) {
      return res.status(400).json({
        message: "Invalid user type."
      });

    }
    //check if user role exists
    const userRole = await userroles.query().findById(user_role_id);

    if (!userRole) {
      return res.status(400).json({
        message: "Invalid user role."
      });

    }
    //check if status exists
    const statusExists = await statuses.query().findById(status_id);
    if (!statusExists) {
      return res.status(400).json({
        message: "Invalid status."
      });
    }

    // Define required attributes for all users
    let requiredAttributes = ['first_name', 'last_name', 'national_id', 'user_email', 'phone_number', 'user_type_id', 'created_by', 'user_role_id'];


    // Check for missing attributes
    const missingAttributes = requiredAttributes.filter(attr => !req.body[attr]);

    if (missingAttributes.length > 0) {
      return res.status(400).json({
        "Missing attributes": missingAttributes.join(', ')
      });
    }
    const userExists = await users.query()
      .where('user_email', user_email)
      .orWhere('phone_number', phone_number)
      .orWhere('national_id', national_id)
      .first();

    if (userExists) {
      return res.status(400).send({
        message: "Failed.User exists! "
      });
    }

    // Insert the new user into the database
    const newUser = await users.query().insert({
      first_name,
      last_name,
      user_email,
      user_password,
      phone_number,
      national_id,
      created_by,
      status_id

    });
    // Step 2: Insert into user_usertype table
    await userusertypes.query().insert({
      user_id: newUser.id,
      user_type_id: user_type_id
    });

    // Step 3: Insert into user_userrole table
    await useruserroles.query().insert({
      user_id: newUser.id,
      user_role_id: user_role_id
    });
    //step 4: insert into employees table if user type is not tenant

    if (userType.user_type !== 1) {

      const estate_id = req.body.estate_id;
      await estates.query().findById(estate_id);

      if (!estate_id) {
        return res.status(400).json({
          message: "Estate ID is required for non-tenant users."
        });
      }
      await employees.query().insert({
        employee_id: newUser.id,
        estate_id: estate_id,
      });
      
      // Return the created user details
      res.status(201).json({
        message: "User Created Successfully.",
        data: {
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          user_email: newUser.user_email,
          phone_number: newUser.phone_number,
          national_id: newUser.national_id,
          user_type: { ...userType },
          user_role: { ...userRole },
          created_at: newUser.created_at,
          user_password: newUser.user_password,
          created_by: newUser.created_by
        }
      });
    }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error creating user: ' + error.message);
    }
  };


  // Update personal details
  const updatePersonalDetails = async (req, res) => {
    const { usersid } = req.params;
    const editables = ["phone_number", "user_email", "user_password", "first_name", "last_name", "national_id",];

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

//To do:
//require user password only if tenant,management staff or admin or secuirty guard