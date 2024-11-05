const permissions = require('./permissions.model');
const vehicles = require('../Vehicle/vehicles.model');

const { updatePersonalDetails } = require('../users/users.controller');


//create permissions : add created by in req.body
const createPermissions = async (req, res) => {
    const  { description,vehicle_id,category_id,user_id,permission_type_id,allowed_user_id,allowed_user_name,allowed_user_phone,allowed_user_national_id,expires_at,permission_status_id} = req.body;
    const requiredAttributes = ['allowed_user_name', 'user_id','allowed_user_national_id','allowed_user_phone','permission_type_id','permission_status_id'];
    const missingAttributes = requiredAttributes.filter(attr => !req.body[attr]);

    console.log(req.body);

    if (missingAttributes.length > 0) {
       
        return res.status(400).json({
            "Missing attributes": missingAttributes.join(',')
        });

    }

    try {

            // Check if the category is for vehicles 
        if (category_id === 8) {
            // Perform vehicle ownership check only if it's a vehicle
            const vehicle = await vehicles.query()
                .where({ id: vehicle_id, user_id }) // Assuming user_id is the vehicle owner ID
                .first();
    
            if (!vehicle) {
                return res.status(403).json({
                    message: "Permission denied. You do not own this vehicle."
                });
            }
        }

        // Check if permission exists for the vehicle
        if (permissionExists) {
            return res.status(400).json({
                message: "Permission for this vehicle already exists."
            });
        
    } else {
        // For non-vehicle categories, check for similar permission by description
        const permissionExists = await permissions.query()
            .where({ user_id, description, expires_at })
            .first();

        if (permissionExists) {
            return res.status(400).json({
                message: "Permission with this description already exists."
            });
        }
    }
        // Create the new permission (for any category)
        const newPermission = await permissions.query().insert({description, permission_status_id, vehicle_id, category_id, user_id, permission_type_id, allowed_user_id, allowed_user_name, allowed_user_phone, allowed_user_national_id, expires_at
        });

        res.status(200).json({
            
            message: "permission  added successfully.",
            data: {
                permission_status_id: newPermission.permission_status_id,
                description:newPermission.description,
                vehicle_id: newPermission.vehicle_id,
                category_id:newPermission.category_id,
                user_id:newPermission.user_id,
                permission_type_id:newPermission.permission_type_id,
                allowed_user_id:newPermission.allowed_user_id,
                allowed_user_name:newPermission.allowed_user_name,
                allowed_user_phone:newPermission.allowed_user_phone,
                allowed_user_national_id:newPermission.allowed_user_national_id,
                expires_at:newPermission.expires_at
              
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating permission : ' + error.message);
    }
};

//Get permission  by Id
const getPermissionsById = async (req, res) => {
    const { permissionId } = req.params;

    try {
        const permission = await permissions
        .query()
        .findById(permissionId)
        .withGraphFetched('[vehicle, permissionStatus,category,permissiontypes]');
       
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

//Get permissions by user Id
const getPermissionsByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        //get the permission
        const userPermissions = await permissions
        .query()
        .where({ user_id: userId })
        .withGraphFetched('[vehicle, permissionStatus,category]'); // Adjust the query to match your database structure
      
        if (!userPermissions || userPermissions.length === 0) {
            console.log(error)
            return res.status(404).json({ error: 'No permissions found for this user' });
        }
        
        // Remove unnecessary keys
        const keysToRemove = ['created_at', 'updated_at'];
        const filteredUserPermissions = userPermissions.map(permissions=> {
            return Object.keys(permissions).reduce((acc, key) => {
                if (!keysToRemove.includes(key)) {
                    acc[key] = permissions[key];
                }
                return acc;
            }, {});

             
        });

        res.status(200).json(filteredUserPermissions);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal server error" });
    }
};




// // Update  permission  details
const updatePermissionDetails = async (req, res) => {
    const { permissionId } = req.params;
    const editables = ["expires_at","permission_type_id","permission_status_id"];
    
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
      const permissionExists = await permissions.query().where({ id: permissionId }).first();
      if (!permissionExists) {
        return res.status(404).json({ message: "Failed! Does not exist!" });
      }
  
      await permissions.query().patch(updates).where({ id: permissionId });
      res.status(200).json({ message: "Updated successfully!" });

    
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  //Delete permissions
  const deletePermissionsById = async (req,res) => {
    const {permissionId} = req.params;

    try{
        //check if permission exists
        const permissionExists = await permissions.query().findById (permissionId);
        if(!permissionExists) {
            return res.status(404).json({ message: "Permission  not found" });
        }
    
        // Delete the permission 
        await permissions.query().deleteById(permissionId);
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
  getPermissionsByUserId,
  updatePermissionDetails,
  deletePermissionsById
}



