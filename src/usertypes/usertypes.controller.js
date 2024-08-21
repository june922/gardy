const usertypes = require('./usertypes.model');
const { get } = require('./usertypes.routes');


//create usertypes : add created by in req.body
const createUserTypes = async (req, res) => {
    const { name } = req.body;
    const requiredAttributes = ['name'];
    const missingAttributes = requiredAttributes.filter(attr => !req.body[attr]);

    if (missingAttributes.length > 0) {
        return res.status(400).json({
            "Missing attributes": missingAttributes.join(',')
        });

    }

    try {

        //check if user type exists verification
    
        const userTypeExists = await usertypes.query()
            .where({name}).first();

        if (userTypeExists) {
            return res.status(400).send({
                message: "Failed.User type already exist !"
            });
        }
        const newUserType = await usertypes.query().insert({ name });
        res.status(200).json({
            message: "User type added successfully.",
            data: {
                usertype: newUserType.name,
              
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating user type: ' + error.message);
    }
};

//Get user type by Id
const getUserTypeById = async (req, res) => {
    const { usertypeid } = req.params;

    try {
        const userType = await usertypes.query().findById(usertypeid);
        if (userType) {
            res.status(200).json(userType);
        }

        if (!userType) {
            return res.status(404).json({ erro: 'User type not found' });
        }

        //List of keys to remove
        const keysToRemove = ['created_at', 'updated_at','created_by'];

        //Object to without keys
        const filteredVisitorType = Object.keys(visitorType).reduce((acc, key) => {
            if (!keysToRemove.includes(key)) {
                acc[key] = userType[key];
            }
            return acc;
        }, {});
        res.status(200).json(filteredUserType);
    } catch (error) {
        console.log (error)
        return res.status(500).send({
            message: "Internal server error"
        });
    }
}

//get all user types
const getAllUserTypes = async (req, res) => {

    try {
        const getUserTypes = await usertypes.query();

        res.status(200).json(getUserTypes);

    } catch (error) {
        return res.status(500).send({
            message: "internal server error."
        });
    }
}


// Update  user type details
const updateUserTypes = async (req, res) => {
    const { usertypeid } = req.params;
    const editables = ["name"];
    
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

    
    if (req.body.name) {
      const userTypeExists = await usertypes.query().where({ name: req.body.name }).first();
      if (userTypeExists) {
        return res.status(400).json({ message: "User type already exists!" });
      }
    }
    
    try {
      const userTypeExists = await usertypes.query().where({ id: usertypeid }).first();
      if (!userTypeExists) {
        return res.status(404).json({ message: "Failed! Does not exist!" });
      }
  
      await usertypes.query().patch(updates).where({ id: usertypeid });
      res.status(200).json({ message: "Updated successfully!" });

    
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  //Delete usertypes
  const deleteUserTypeById = async (req,res) => {
    const {usertypeid} = req.params;

    try{
        //check if userType exists
        const userTypeExists = await usertypes.query().findById (usertypeid);
        if(!userTypeExists) {
            return res.status(404).json({ message: "User type not found" });
        }
    
        // Delete the user type
        await usertypes.query().deleteById(usertypeid);
        res.status(200).json({ message: "User type deleted successfully" });

      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
      }
    };


module.exports = {
  createUserTypes,
  updateUserTypes,
  getAllUserTypes,
  getUserTypeById,
  deleteUserTypeById
}



