const users = require('../users/users.model');
const refreshtoken = require ('./refreshtoken.model');
const tenantdetails = require ('../tenantdetails/tenantdetails.model');
const tenant = require ('../tenant/tenant.model')
const bcrypt = require ('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const emailverifytoken = require('./emailverifytoken.model');
const { emailTransporter} = require('../../middleware');
// const passwordresetotp = require('./passwrodresetotp.model');



//Register user
const registerUser = async (req, res) => {
 
  try {
    const {
      user_type_id,
      first_name,
      last_name,
      user_email,
      user_password,
      phone_number,
      national_id,
      
    } = req.body;


    // Define required attributes for each user type
    const requiredAttributes = {
      '1': ['user_type_id', 'first_name', 'last_name', 'user_email', 'user_password', 'phone_number', 'national_id'], // Estate Admin
      '3': ['user_type_id', 'first_name', 'last_name', 'user_email', 'user_password', 'phone_number', 'national_id'] // Tenant
    };

    // // Convert user_type_id to string for consistent lookup
    const requiredAttributesForUserType = requiredAttributes[String(user_type_id)];
    if (!requiredAttributesForUserType) {
      return res.status(400).send({ message: 'Invalid user type.' });
    }

    // Check for missing attributes
    const missingAttributes = requiredAttributesForUserType.filter(attr => !req.body[attr]);
    if (missingAttributes.length > 0) {
      return res.status(400).json({
        message: `Missing required attributes: ${missingAttributes.join(', ')}`
      });
    }

    // Password strength check
    if (!isStrongPassword(user_password)) {
      return res.status(400).send({
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(user_password, 10);

    // Check if user already exists
    const userExists = await users.query()
      .where('user_email', user_email)
      .orWhere('national_id', national_id)
      .first();
    if (userExists) {
      return res.status(400).send({
        message: 'Failed. User exists!'
      });
    }

    // Insert the new user into the database
    const newUser = await users.query().insert({
      first_name,
      last_name,
      user_email,
      user_password: hashedPassword,
      phone_number,
      user_type_id,
      national_id,
    });

    // Return the created user details
    res.status(201).json({
      message: 'User Created Successfully.',
      data: {
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        user_email: newUser.user_email,
        phone_number: newUser.phone_number,
        national_id: newUser.national_id,
        user_type_id: newUser.user_type_id,
        created_by: newUser.created_by
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating user: ' + error.message);
  }
};

//password strength chech


function isStrongPassword(user_password) {
  // Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character
  const userpasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return userpasswordRegex.test(user_password);
}

  


//sign in

const signIn = async (req, res) => {
  const { user_email, user_password } = req.body;

  try {
    // Check if the user exists
    const user = await users.query().findOne({ user_email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(user_password, user.user_password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return user details and token
    res.status(200).json({
      message: 'Login successful',
      data: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        user_email: user.user_email,
        phone_number: user.phone_number,
        national_id: user.national_id,
        token
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error signing in: ' + error.message);
  }
}




module.exports = {
  registerUser,
  signIn

  