const users = require('../users/users.model');
const visitortypes = require('../visitortypes/visitortypes.model');
const visitors = require('./visitors.model');
// const tenant = require ('../tenant/tenant.model');
// const tenantdetails = require('..tenantdetails/tenantdetails');

// Create visitor
const createVisitor = async (req, res) => {
  const { visitor_name, contact_info, vehicle_plate, tenant_id,expected_date, description,visitor_type_id } = req.body;
  
    // Insert the new visitor into the database
    const newVisitor = await visitors.query().insert({
      visitor_name,
      contact_info,
      vehicle_plate,
      tenant_id,
      expected_date,
      description,
      visitor_type_id,
  
    });

    // Return the created visitor details
    res.status(201).json({
      message: "Visitor Created Successfully.",
      data: {
        visitor_name: newVisitor.visitor_name,
        contact_info: newVisitor.contact_info,
        vehicle_plate: newVisitor.vehicle_plate,
        tenant_id: newVisitor.tenant_id,
        expected_date: newVisitor.expected_date,
        description: newVisitor.description,
        visitor_type_id:newVisitor.visitor_type_id,
      }
    });

  }
  
  

// // Update personal details
// const updatePersonalDetails = async (req, res) => {
//   const { usersid } = req.params;
//   const editables = ["phone_number","user_email"];
  
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

// // Get personal details by ID
// const getPersonalDetailsById = async (req, res) => {
//   const { usersid } = req.params;

//   try {
//     const user = await users.query().findById(usersid);

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const keysToRemove = ['user_password', 'created_at', 'updated_at'];
//     const filteredUser = Object.keys(user).reduce((acc, key) => {
//       if (!keysToRemove.includes(key)) {
//         acc[key] = user[key];
//       }
//       return acc;
//     }, {});

//     res.status(200).json(filteredUser);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

// // Get all users
// const getAllUsers = async (req, res) => {
//   try {
//     const allUsers = await users.query();
//     res.status(200).json(allUsers);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

// //Delete user
// const deleteUserById = async (req, res) => {
//   const { usersid } = req.params;

//   try {
//     // Check if the user exists
//     const user = await users.query().findById(usersid);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Delete the user
//     await users.query().deleteById(usersid);

//     res.status(200).json({ message: "User deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

module.exports = {
  createVisitor,
  // updatePersonalDetails,
  // getPersonalDetailsById,
  // getAllUsers,
  // deleteUserById
};

//To do:
//require user password only if tenant,management staff or admin or secuirty guard