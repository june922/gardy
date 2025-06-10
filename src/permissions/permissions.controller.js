const permissions = require('./permissions.model');
const vehicles = require('../Vehicles/vehicles.model');
const permissiontypes = require('../permissiontypes/permissiontypes.model');
const category = require('../category/category.model');
const moment = require('moment');
const { parse } = require('path');

// const { updatePersonalDetails } = require('../users/users.controller');


const createPermissions = async (req, res) => {
    console.log(req.body)
    const { description, vehicle_id, category_id, user_id, permission_type_id, allowed_user_name, allowed_user_phone, allowed_user_national_id, expires_at, permission_status_id } = req.body;

    const requiredAttributes = ['allowed_user_name', 'user_id', 'allowed_user_national_id', 'allowed_user_phone', 'permission_type_id'];
    const missingAttributes = requiredAttributes.filter(attr => !req.body[attr]);

    if (missingAttributes.length > 0) {
        console.log("Missing attributes:", missingAttributes);
        return res.status(400).json({
            message: "Missing required attributes",
            missingAttributes
        });
    }

    try {
        // Fetch category and permission type lists
        const categoriesList = await category.query().select('id', 'name');
        const permissionTypesList = await permissiontypes.query().select('id', 'name');

        // Validate category_id
        const categoryExists = await category.query().findById(category_id);
        if (!categoryExists) {
            return res.status(400).json({ message: "Invalid category ID" });
        }

        // Validate permission_type_id
        const permissionTypeExists = await permissiontypes.query().findById(permission_type_id);
        if (!permissionTypeExists) {
            return res.status(400).json({ message: "Invalid permission type ID" });
        }

        // Logic when the category is "vehicles" (ID 8)
        if (category_id === 8) {
            if (vehicle_id) {
                // If vehicle_id is provided, check if the user owns it
                const vehicle = await vehicles.query()
                    .where({ id: vehicle_id, user_id }) // Ensure the user owns the vehicle
                    .first();

                if (!vehicle) {
                    return res.status(403).json({ message: "Permission denied. You do not own this vehicle." });
                }
            } else {
                // If no vehicle_id is provided, show the user's vehicles list
                const userVehicles = await vehicles.query().where({ user_id }).select('id', 'make', 'model', 'registration_number');

                if (userVehicles.length === 0) {
                    return res.status(400).json({
                        message: "You do not have any registered vehicles. Please provide vehicle details."
                    });
                }

                // Return a list of the user's vehicles
                return res.status(200).json({
                    message: "List of your vehicles",
                    vehicles: userVehicles
                });
            }
        } 
        // Logic for the "other" category (ID 6) - only description and other details
        else if (category_id === 6) {
            // If the category is "other", only the description and other required details should be provided
            if (!description) {
                return res.status(400).json({
                    message: "Description is required for 'other' category"
                });
            }
        }
         // Handle dynamic date formatting based on permission type
    let formattedExpiresAt = null;
    if (permission_type_id !== 1 && expires_at) {
      // If not permanent permission (permission_type_id !== 1), format expires_at
      formattedExpiresAt = moment(expires_at).toISOString();
    }

        // Proceed with creating the permission (after validation)
        const newPermission = await permissions.query().insert({
            description,
            vehicle_id: vehicle_id ? parseInt(vehicle_id) : null,
            category_id:parseInt(category_id),
            user_id: parseInt(user_id),
            permission_type_id:parseInt(permission_type_id),
            permission_status_id: parseInt(permission_status_id) || 1, // Default to 1 if not provided
            allowed_user_name,
            allowed_user_phone,
            allowed_user_national_id:parseInt(allowed_user_national_id),
            expires_at,
            
        });

        res.status(201).json({
            message: "Permission created successfully",
            ...newPermission
        });

    } catch (err) {
        console.error("Error creating permission:", err);
        return res.status(500).json({ message: "An error occurred while creating the permission." });
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
const getPermissionsByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        // Get the permission
        const userPermissions = await permissions
            .query()
            .where({ user_id: userId })
            .withGraphFetched('[vehicle, permissionStatus, category]'); 
        
        // Return an empty array instead of 404
        if (!userPermissions || userPermissions.length === 0) {
            return res.status(200).json([]); 
        }
        
        // Remove unnecessary keys
        const keysToRemove = ['created_at', 'updated_at'];
        const filteredUserPermissions = userPermissions.map(permission => {
            return Object.keys(permission).reduce((acc, key) => {
                if (!keysToRemove.includes(key)) {
                    acc[key] = permission[key];
                }
                return acc;
            }, {});
        });

        res.status(200).json(filteredUserPermissions);
    } catch (error) {
        console.error("Error fetching permissions:", error);
        return res.status(500).json({ message: "Internal server error" });
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



