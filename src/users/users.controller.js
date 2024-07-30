const users = require('./users.model');

// Create user
const createUser = async (req, res) => {
  const { first_name, last_name, user_email, user_password, phone_number } = req.body;
  const requiredAttributes = ['first_name', 'last_name', 'user_email', 'user_password', 'phone_number'];
  const missingAttributes = requiredAttributes.filter(attr => !req.body[attr]);

  if (missingAttributes.length > 0) {
    return res.status(400).json({
      "Missing attributes": missingAttributes.join(', ')
    });
  }

  try {
    const newUser = await users.query().insert({ first_name, last_name, user_email, user_password, phone_number });
    res.status(201).json({
      message: "User Created Successfully.",
      data: {
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        user_email: newUser.user_email,
        phone_number: newUser.phone_number,
        user_password: user_password
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating user: ' + error.message);
  }
};



module.exports = {
  createUser
}
