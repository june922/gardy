const users = require('../users/users.model');
const refreshtoken = require ('./refreshtoken.model');
const bcrypt = require ('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const emailverifytoken = require('./emailverifytoken.model');
const { emailTransporter} = require('../../middleware');
// const passwordresetotp = require('./passwrodresetotp.model');



//Register user
  const registerUser = async (req, res) => {
  const {user_type_id, first_name, last_name, user_email, user_password, phone_number,national_id,created_by} = req.body;
  const requiredAttributes = ['first_name', 'last_name', 'user_email', 'user_password', 'national_id','phone_number','user_type_id','created_by'];
  const missingAttributes = requiredAttributes.filter(attr => !req.body[attr]);

  if (missingAttributes.length > 0) {
    return res.status(400).json({
      "Missing attributes": missingAttributes.join(', ')
    });
  }

//email verification
  try {
    const userExists = await users.query ()
    .where('user_email', user_email)
    .orWhere('national_id', national_id)
    .first();

    if (userExists) {
        return res.status(400).send({
            message:"Failed.User exists! "
        });
    
    }
  //password strenght check
    if (!isStrongPassword(user_password)) {
      return res.status(400).send({message:  'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.' });
    }
 // hash password
 const hashedPassword = await bcrypt.hash(user_password,10);
 //check existing user
 const newUser = await users.query().insert({ first_name, last_name, user_email, user_password:hashedPassword, phone_number,national_id,user_type_id,created_by});
 res.status(200).json({
   message: "User Created Successfully.",
   data: {
     first_name: newUser.first_name,
     last_name: newUser.last_name,
     user_email: newUser.user_email,
     phone_number: newUser.phone_number,
     user_password: hashedPassword.user_password,
     user_type_id:newUser.user_type_id,
     national_id:newUser.national_id,
     created_by:newUser.created_by
   }
 });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating user: ' + error.message);
  }
};

function isStrongPassword(user_password) {
  // Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character
  const userpasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return userpasswordRegex.test(user_password);
}

//sign in
const signin = async (req, res) => {
  const { user_email, user_password } = req.body;
  const requiredAttributes = ['user_email', 'user_password'];

  
  const missingAttributes = requiredAttributes.filter(attr => !req.body[attr]);

  if (missingAttributes.length > 0) {
    return res.status(400).json({
      "Missing attributes": missingAttributes.join(', ')
    });
  }
  try {
    const user = await users.query().findOne({ user_email: req.body.user_email });

    if (!user) {
      return res.status(401).send({ message: "Incorrect login credentials." });
    }


    const passwordIsValid = bcrypt.compareSync(req.body.user_password, user.user_password);

    if (!passwordIsValid) {
      return res.status(401).send({ message: "Incorect login credentials." });
    }
    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.user_email }, process.env.JWT_SECRET, {
      expiresIn: 3600 
    });
    //Generate refreshtoken
    const refreshToken = await refreshtoken.createToken(user);
    console.log(refreshToken)
  
    return res.status(200).json({
      message: "Welcome to Garde.",
      user:{
        user_id:user.id,
        user_email:user.user_email},

      token : token,
      refreshToken:refreshToken
     });

    } catch (error) {
      console.error(error);
      if (error.message === "Cannot read properties of undefined (reading 'id')") {
        return res.status(401).send({ message: "Login not allowed for this account !." });
      }
      return res.status(500).send({ message: error.message });
    }
  };

    
//refreshToken
  const refreshToken = async (req, res) => {
      const { refreshToken: requestToken } = req.body;

      try {
        const token = await refreshtoken.query().findOne({token: requestToken});
        if (!token) {
          return res.status(403).json({message: "Refresh token is not valid."});
        }
       
      const user = await refreshtoken.$relatedQuery('user');
      let newAccessToken = jwt.sign({ id: user.id }, config.secret, { expiresIn: config.jwtExpiration });
    
      return res.status(200).json({ accessToken: newAccessToken, refreshToken: refreshtoken.token });

    } catch (error) {
      console.error(error);
      return res.status(500).send({ message: error.message });
    }
  };
  

  
//email verification
const initiateEmailVerification = async (req,res) => {
  try {
  //1. Verify the user token from th request headers
const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res.status (401).send({message:'unauthorized'});
  }
  const token = authHeader.split ('')[1];
  const decodedToken = jwt.verify(token,config.secret);
  const userId = decodedToken.id;

 console. log (error);
  //2.check if email is already verified
const user = await users.query().findById(userId);
if (user.user_email_verified === true) {
  return res.status (400).send ({message: 'Email already verified'});

}
//Generate email verification token
 const emailVerifyToken = await emailverifytoken.createToken(user);
 
console.log (error);
//send and email to the user with the verification link
 const encodedToken = encodedURIComponent(emailVerifyToken);
 const baseUrl = process.env.EMAIL_VERIFICATION_LINK
 const verificationLink = '${baseUrl}${encodedToken}';

console.log (error);
 emailTransporter.sendMail ({
  from: process.env.SMTP_MAIL_SENDER,
  to: user.user_email,
  subject: 'email verification Link',
  html: `<b>Hi ${user.first_name} ${user.last_name},</b><br>
      <p>You requested for your Locum account email verification.</p><br>
      <b>Please click <a href="${verificationLink}">here</a> to verify your email.</b>`,
    }).then(info => {
      console.log('Email sent:', info.response);
      return res.status(200).send({ message: 'Email verification link sent successfully.' });
    }).catch(error => {
      console.error('Error sending email:', error);
      return res.status(400).send({ message: 'Error sending email verification email verification link.' });
    });
console.log (error);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: error.message });
  }
}

const emailVerification = async (req,res) => {
  try {
    const { token } = req.params;
    //validate token here
    if (!token) {
      return res.status(400).send({message: 'Invalid request'});
    }
    try{
      const urldecodedToken = decodedURIComponent (token);
      const decodedToken = jwt.verify(urldecodedToken,config.secret);
      const userId = decodedToken.id;
//if token is validated,update the users emmail verified status to true
const user = await users.query().findById(userId);
if (!user) {
  return res.status(404).send({message: 'user not found'});
}
user.user_email_verified = true;
user.update_at = new Date ().toISOString();
await users.$query().patch();
emailTransporter.sendMail({
  from:process.env.SMTP_MAIL_SENDER,
  to: user.User_email,
  subject: 'Email verified',
  html:`<b>Hi ${user.first_name} ${user.last_name},</b><br>
        <p>Your Garde account email verification was successful.<br></p>
        <p>Enjoy your experience on Locum fully!</p><br><br>
        <b>Cheers,<br>
        Garde Team 👻</b>`,
      }).then(info => {
        console.log('Email sent:', info.response);
        return res.status(200).send({ message: 'Email verified successfully' });
      }).catch(error => {
        console.error('Error sending email:', error);
        return res.status(400).send({ message: 'Error sending email verification confirmation email.' });
      });
    } catch (error) {
      console.error(error);
      return res.status(401).send({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: error.message });
  }
}





module.exports = {
  registerUser,
  signin,
  refreshToken,
  initiateEmailVerification,
  emailVerification
}
