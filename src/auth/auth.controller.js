const users = require('../users/users.model');
const tenants = require('../tenants/tenants.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const emailTransporter = require('../../middleware/emailtransporter');
const passwordresetotp = require('./passwordresetotp.model');
const userusertypes = require('../userusertypes/userusertypes.model');
const usertypes = require('../usertypes/usertypes.model');
const useruserroles = require('../useruserroles/useruserroles.model');
const userroles = require('../userroles/userroles.model');


//Register user
const registerUser = async (req, res) => {

  try {
    const { user_type_id, first_name, last_name, user_email, user_password, phone_number, national_id, } = req.body;


    // Define required attributes for each user type
    const requiredAttributes = {
      '1': ['user_type_id', 'first_name', 'last_name', 'user_email', 'user_password', 'phone_number', 'national_id'], // Estate Admin
      '3': ['user_type_id', 'first_name', 'last_name', 'user_email', 'user_password', 'phone_number', 'national_id'] // Tenant
    };

    // Convert user_type_id to string for consistent lookup
    const requiredAttributesForUserType = requiredAttributes[String(user_type_id)];
    if (!requiredAttributesForUserType) {
      return res.status(400).send({ message: 'Invalid user type.' });
    }

    // Check if user type exists
    const userType = await usertypes.query().findById(user_type_id);
    if (!userType) {
      return res.status(400).send({ message: 'Invalid user type.' });
    }
    //pre authorisation for tenants
    const tenantMatch = await tenants.query()
      .where('user_email', user_email);

    if (tenantMatch.length === 0) {
      return res.status(400).send({
        message: 'Please contact your estate manager for authorisation.'
      });
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
      national_id,
    });


   //Email verification

    emailTransporter.sendMail({
      from: process.env.SMTP_MAIL_SENDER, // Email sender
      to: newUser.user_email, // Recipient email
      subject: 'Email Verification Link', // Subject for email verification
      html: `<b>Hi ${newUser.first_name} ${newUser.last_name},</b><br>
          <p>Thank you for registering! Please click the link below to verify your email address and complete your registration:</p>
          <a href="${process.env.EMAIL_VERIFICATION_LINK}${jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' })}" 
             style="font-weight:bold; color: darkblue; text-decoration: none;">
             Verify your email
          </a>
          <h2>If this wasn't you!</h2>
          <p>If you did not create an account, please ignore this email.</p>
          <p>If you have any questions, please contact us at <em>support@garde.tech</em></p>`,
    }).then(info => {
      console.log('Email sent:', info.response);
      return res.status(200).send({ message: 'Email verification link sent successfully.' });
    }).catch(error => {
      console.error('Error sending email:', error);
      return res.status(400).send({ message: 'Error sending email verification link.' });
    });



    // Insert into user_usertype table
    await userusertypes.query().insert({
      user_id: newUser.id,
      user_type_id: user_type_id
    });
    // Define the default role for each user_type_id
    const defaultRoleMapping = {
      '3': 1, // Estate Admin → Admin role
      '1': 3  // Tenant → Tenant role
    };

    const defaultRoleId = defaultRoleMapping[String(user_type_id)];

    if (!defaultRoleId) {
      return res.status(400).send({ message: 'No default role defined for this user type.' });
    }

    // Insert into user_userroles table
    await useruserroles.query().insert({
      user_id: newUser.id,
      user_role_id: defaultRoleId

    });
    // Fetch the full role details
    const defaultRole = await userroles.query().findById(defaultRoleId);

    // Return the created user details
    res.status(201).json({
      message: 'User Created Successfully.',
      data: {
        ...newUser,
        user_type: { ...userType },
        user_role: { ...defaultRole }, // Assuming you have a way to get the role name

      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating user: ' + error.message);
  }
};

//Reset passoword

const initiatePasswordReset = async (req, res) => {
  try {
    const { user_email } = req.body;
    if (!user_email) {
      return res.status(404).send({ message: 'Invalid request' });
    }

    // Check if the email exists in the database
    const user = await users.query().findOne({ user_email });
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const otp = await passwordresetotp.createOTP((parseInt(user.id)));

    if (otp) {
      emailTransporter.sendMail({
        from: process.env.SMTP_MAIL_SENDER,
        to: user.user_email,
        subject: 'Password Reset Code',
        html: `<b>Hi ${user.first_name} ${user.last_name},</b><br>
                <p>You requested for a code to facilitate your account password reset.<br>
                Please use the code below;<br>
                <span style="font-weight:bold;font-size:26px;color:darkgray;">${otp}</span></p>
                <h2>If this wasn't you !</h2>
                <p>This email was sent because someone attempted to reset your garde account password.<br>The attempt included your correct email address.<br>
                Please  ignore this email or contact us at <em>support@garde.tech</em></p>`,
      }).then(info => {
        console.log('Email sent:', info.response);
        return res.status(200).send({ message: 'Password reset code sent successfully.' });
      }).catch(error => {
        console.error('Error sending email:', error);
        return res.status(400).send({ message: 'Error sending password reset code.' });
      });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: error.message });
  }
}
const passwordReset = async (req, res) => {
  try {
    const { user_email } = req.body;
    const { otp } = req.body;
    const { user_password } = req.body;

    // console.log(email, otp, password)
    if (!user_email || !otp || !user_password) {
      return res.status(404).send({ message: 'Invalid request' });
    }

    // Check if the email exists in the database
    const user = await users.query().findOne({ user_email });
  
    if (!user) {
      return res.status(404).send({ message: 'Invalid request' });
    }

    // check password strength
    if (!isStrongPassword(user_password)) {
      return res.status(400).send({ message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.' });
    }

    // Validate OTP
    const validOTP = await passwordresetotp.verifyOTP(otp,user.id);

    if (!validOTP) {
      return res.status(404).send({ message: 'Invalid or Expired Code' });
    }

    // Update user password
    const hashedPassword = bcrypt.hashSync(user_password, 10);
    user.user_password = hashedPassword;
    user.updated_at = new Date().toISOString();
    await user.$query().patch();

    emailTransporter.sendMail({
      from: process.env.SMTP_MAIL_SENDER,
      to: user.user_email,
      subject: 'Password Reset Successfully',
      html: `<b>Hi ${user.first_name} ${user.last_name},</b><br>
              <p>Your Garde account password was reset successfully.</p><br>
              <h2>If this wasn't you !</h2>
              <p>This email was sent because someone successfully reset your Garde account password.<br>
              Urgently contact us at <em>support@garde.tech</em></p>`,
    }).then(info => {
      console.log('Email sent:', info.response);
      return res.status(200).send({ message: 'Password reset successfully.' });
    }).catch(error => {
      console.error('Error sending email:', error);
      return res.status(400).send({ message: 'Error sending password reset code.' });
    });


  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: error.message });
  }

}

//password strength checK
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
  signIn,
  initiatePasswordReset,
  passwordReset,

}