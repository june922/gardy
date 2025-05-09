
const userroles = require('./userroles.model');

//create 
const createUserRoles = async (req, res) => {
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
    
        const userRoleExists = await userroles.query()
            .where({name}).first();

        if (userRoleExists) {
            return res.status(400).send({
                message: "Failed.Already exist !"
            });
        }
        const newUserRole = await userroles.query().insert({ name });
        res.status(200).json({
            message: "Added successfully.",
            data: {
                usertype: newUserRole.name,
              
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating user type: ' + error.message);
    }
};

//Get  by Id
const getuserRoleById = async (req, res) => {
    const { userroleId } = req.params;

    try {
        const userRoles = await userroles.query().findById(userroleId);
        if (userRoles) {
            res.status(200).json(userRoles);
        }

        if (!userRoles) {
            return res.status(404).json({ erro: 'Not found' });
        }

        //List of keys to remove
        const keysToRemove = ['created_at', 'updated_at','created_by'];

        //Object to without keys
        const filteredUserRole = Object.keys(userRoles).reduce((acc, key) => {
            if (!keysToRemove.includes(key)) {
                acc[key] = userRoles[key];
            }
            return acc;
        }, {});
        res.status(200).json(filteredUserRole);

    } catch (error) {
        console.log (error)
        return res.status(500).send({
            message: "Internal server error"
        });
    }
}

//get all 
const getAll = async (req, res) => {

    try {
        const get = await userroles.query();

        res.status(200).json(get);

    } catch (error) {
        return res.status(500).send({
            message: "internal server error."
        });
    }
}


// Update   details
const update = async (req, res) => {
    const { userroleId } = req.params;
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
      const userRoleExists = await userroles.query().where({ name: req.body.name }).first();
      if (userRoleExists) {
        return res.status(400).json({ message: "User type already exists!" });
      }
    }
    
    try {
      const userRoleExists = await userroles.query().where({ id: userroleId }).first();
      if (!userRoleExists) {
        return res.status(404).json({ message: "Failed! Does not exist!" });
      }
  
      await userroles.query().patch(updates).where({ id: userroleId });
      res.status(200).json({ message: "Updated successfully!" });

    
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  //Delete userroles
  const deleteById = async (req,res) => {
    const {userroleId} = req.params;

    try{
        //check if userRole exists
        const userRoleExists = await userroles.query().findById (userroleId);
        if(!userRoleExists) {
            return res.status(404).json({ message: " Not found" });
        }
    
        // Delete
        await userroles.query().deleteById(userroleId);
        res.status(200).json({ message: "Deleted successfully" });

      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
      }
    };


module.exports = {
  createUserRoles,
  update,
  getAll,
  getuserRoleById,
  deleteById

  // Add other controller functions as needed
}



