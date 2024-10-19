const permissions = require('./permissions.model');
const vehicles = require('../Vehicle/vehicles.model');
const { updatePersonalDetails } = require('../users/users.controller');


//create permissions : add created by in req.body
const createPermissions = async (req, res) => {
    const  { vehicle_id,user_id,allowed_user_id,permission_type_id,expires_at } = req.body;
    const requiredAttributes = ['vehicle_id', 'user_id','allowed_user_id','permission_type_id','expires_at'];
    const missingAttributes = requiredAttributes.filter(attr => !req.body[attr]);

    if (missingAttributes.length > 0) {
        return res.status(400).json({
            "Missing attributes": missingAttributes.join(',')
        });

    }

    try {

            // Check if the user owns the vehicle
            const vehicle = await vehicles.query()
                .where({ id: vehicle_id, user_id }) // Assuming owner_id is the column for vehicle owner
                .first();
    
            if (!vehicle) {
                return res.status(403).json({
                    message: "Permission denied. You do not own this vehicle."
                });
            }

        //          // Check if the allowed user is valid (guest or visitor)
        // const allowedUser = await users.query().where({ id: allowed_user_id }).first();
        // if (!allowedUser || !(allowedUser.type === 'guest' || allowedUser.type === 'visitor')) {
        //     return res.status(400).json({ message: "The allowed user must be a guest or visitor." });
        // }

        // // Check if the allowed user has checked in at the gate for the owner's house number
        // const houseNumber = vehicleOwner.house_number; // Assuming you have a house_number in your vehicleOwner record
        // const visitorCheckIn = await checkIns.query()
        //     .where({ user_id: allowed_user_id, house_number })
        //     .first();

        // if (!visitorCheckIn) {
        //     return res.status(400).json({ message: "The visitor must have checked in at your house." });
        // }
            // Check if the permission type is "permanent"
    // if (permission_type_id === 'permanent' && expires_at) {
    //     return res.status(400).json({
    //         message: "Cannot set 'expires_at' for permanent permissions."
    //     });
    // }


        //check if permission  exists verification
    
        const permissionExists = await permissions.query()
            .where({vehicle_id,allowed_user_id,permission_type_id,expires_at}).first();

        if (permissionExists) {
            return res.status(400).send({
                message: "Failed.permission already exist !"
            });
        }
        const newPermission = await permissions.query().insert ({ vehicle_id,user_id,allowed_user_id,permission_type_id,expires_at });
        res.status(200).json({
            message: "permission  added successfully.",
            data: {
                vehicle_id: newPermission.vehicle_id,
              
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating permission : ' + error.message);
    }
};

//Get permission  by Id
const getPermissionsById = async (req, res) => {
    const { permissionid } = req.params;

    try {
        const permission = await permissions.query().findById(permissionid);
       
            if (!permission) {
            return res.status(404).json({ erro: 'Permission  not found' });
        }

        //List of keys to remove
        const keysToRemove = ['updated_at'];

        //Object to without keys
        const filteredPermissions = Object.keys(permission).reduce((acc, key) => {
            if (!keysToRemove.includes(key)) {
                acc[key] = permission[key];
            }
            return acc;
        }, {});
        res.status(200).json(filteredPermissions);
    } catch (error) {
        console.log (error)
        return res.status(500).send({
            message: "Internal server error"
        });
    }
}

//get all permission 
const getAllPermissions = async (req, res) => {

    try {
        const getPermissions = await permissions.query();

        res.status(200).json(getPermissions);

    } catch (error) {
        console.log(error)
        return res.status(500).send({
            message: "internal server error."
        });
    }
}


// // Update  permission  details
const updatePermissionDetails = async (req, res) => {
    const { permissionid } = req.params;
    const editables = ["expires_at","permission_type_id"];
    
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


    
    try {
      const permissionExists = await permissions.query().where({ id: permissionid }).first();
      if (!permissionExists) {
        return res.status(404).json({ message: "Failed! Does not exist!" });
      }
  
      await permissions.query().patch(updates).where({ id: permissionid });
      res.status(200).json({ message: "Updated successfully!" });

    
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  //Delete permissions
  const deletePermissionsById = async (req,res) => {
    const {permissionid} = req.params;

    try{
        //check if permission exists
        const permissionExists = await permissions.query().findById (permissionid);
        if(!permissionExists) {
            return res.status(404).json({ message: "Permission  not found" });
        }
    
        // Delete the permission 
        await permissions.query().deleteById(permissionid);
        res.status(200).json({ message: "Permission type deleted successfully" });

      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
      }
    };


module.exports = {
  createPermissions,
   getAllPermissions,
  getPermissionsById,
  updatePermissionDetails,
  deletePermissionsById
}



