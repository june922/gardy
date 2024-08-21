const permissiontypes = require('./permissiontypes.model');



//create permissiontypes : add created by in req.body
const createPermissionTypes = async (req, res) => {
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
    
        const permissionTypeExists = await permissiontypes.query()
            .where({name}).first();

        if (permissionTypeExists) {
            return res.status(400).send({
                message: "Failed.permission type already exist !"
            });
        }
        const newPermissionType = await permissiontypes.query().insert({ name });
        res.status(200).json({
            message: "permission type added successfully.",
            data: {
                permissiontype: newPermissionType.name,
              
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating permission type: ' + error.message);
    }
};

//Get permission type by Id
const getPermissionTypeById = async (req, res) => {
    const { permissiontypeid } = req.params;

    try {
        const permissionType = await permissiontypes.query().findById(usertypeid);
        if (permissionType) {
            res.status(200).json(userType);
        }

        if (!permissionType) {
            return res.status(404).json({ erro: 'Permission type not found' });
        }

        //List of keys to remove
        const keysToRemove = ['created_at', 'updated_at','created_by'];

        //Object to without keys
        const filteredPermissionType = Object.keys(permissionType).reduce((acc, key) => {
            if (!keysToRemove.includes(key)) {
                acc[key] = permissionType[key];
            }
            return acc;
        }, {});
        res.status(200).json(filteredPermissionType);
    } catch (error) {
        console.log (error)
        return res.status(500).send({
            message: "Internal server error"
        });
    }
}

//get all permission types
const getAllPermissionTypes = async (req, res) => {

    try {
        const getPermissionTypes = await permissiontypes.query();

        res.status(200).json(getPermissionTypes);

    } catch (error) {
        return res.status(500).send({
            message: "internal server error."
        });
    }
}


// Update  permission type details
const updatePermissionTypes = async (req, res) => {
    const { permissiontypeid } = req.params;
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
      const permissionTypeExists = await permissiontypes.query().where({ name: req.body.name }).first();
      if (permissionTypeExists) {
        return res.status(400).json({ message: "User type already exists!" });
      }
    }
    
    try {
      const permissionTypeExists = await permissiontypes.query().where({ id: permissiontypeid }).first();
      if (!permissionTypeExists) {
        return res.status(404).json({ message: "Failed! Does not exist!" });
      }
  
      await permissiontypes.query().patch(updates).where({ id: permissiontypeid });
      res.status(200).json({ message: "Updated successfully!" });

    
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  //Delete permissiontypes
  const deletePermissionTypeById = async (req,res) => {
    const {permissiontypeid} = req.params;

    try{
        //check if userType exists
        const permissionTypeExists = await permissiontypes.query().findById (permissiontypeid);
        if(!permissionTypeExists) {
            return res.status(404).json({ message: "Permission type not found" });
        }
    
        // Delete the permission type
        await permissiontypes.query().deleteById(permissiontypeid);
        res.status(200).json({ message: "Permission type deleted successfully" });

      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
      }
    };


module.exports = {
  createPermissionTypes,
  updatePermissionTypes,
  getAllPermissionTypes,
  getPermissionTypeById,
  deletePermissionTypeById
}



