const { response } = require('express');
const vehicles = require('./vehicles.model');
const { error } = require('console');

//create vehicle
const createVehicle = async (req, res) => {
    const { user_id,vehicle_make, vehicle_model, number_plate, vehicle_color, vehicle_type } = req.body;
    const requiredAttributes = ['user_id','vehicle_make', 'vehicle_model', 'number_plate', 'vehicle_color', 'vehicle_type'];
    const missingAttributes = requiredAttributes.filter(attr => !req.body[attr]);

    if (missingAttributes.length > 0) {
        return res.status(400).json({
            "Missing attributes": missingAttributes.join(',')
        });

    }

    try {

        //check if vehicle exists verification

        const vehicleExists = await vehicles.query()
            .where({
                number_plate: number_plate
            }).first();

        if (vehicleExists) {
            return res.status(400).send({
                message: "Failed.Vehicle already exist !"
            });
        }
        const newVehicle = await vehicles.query().insert({ user_id,vehicle_make, vehicle_model, number_plate, vehicle_color, vehicle_type });
        res.status(200).json({
            
            message: "Vehicle added successfully.",
            data: {
                make: newVehicle.vehicle_make,
                model: newVehicle.vehicle_model,
                plate: newVehicle.number_plate,
                color: newVehicle.vehicle_color,
                type: newVehicle.vehicle_type,
                owner:newVehicle.user_id
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating user: ' + error.message);
    }
};

//Get vehicle by Id
const getVehiclesById = async (req, res) => {
    const { vehicleId } = req.params;

    try {
        const vehicle = await vehicles.query().findById(vehicleId);

        if (!vehicle) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        //List of keys to remove
        const keysToRemove = ['created_at', 'updated_at'];

        //Object to without keys
        const filteredVehicle = Object.keys(vehicle).reduce((acc, key) => {
            if (!keysToRemove.includes(key)) {
                acc[key] = vehicle[key];
            }
            return acc;
        }, {});
        res.status(200).json(filteredVehicle);
    } catch (error) {
        console.log (error)
        return res.status(500).send({
            message: "Internal server error"
        });
    }
}

//get all vehicles
const getAllVehicles = async (req, res) => {

    try {
        const allVehicles = await vehicles.query();

        res.status(200).json(allVehicles);

    } catch (error) {
        return res.status(500).send({
            message: "internal server error."
        });
    }
}
// Assuming you have a model to interact with your database
const getVehiclesByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const userVehicle = await vehicles.query().where({ user_id: userId }); // Adjust the query to match your database structure

        if (!userVehicle || userVehicle.length === 0) {
            console.log(error)
            return res.status(404).json({ error: 'No vehicles found for this user' });
        }
        
        // Remove unnecessary keys
        const keysToRemove = ['created_at', 'updated_at'];
        const filteredUserVehicles = userVehicle.map(vehicle => {
            return Object.keys(vehicle).reduce((acc, key) => {
                if (!keysToRemove.includes(key)) {
                    acc[key] = vehicle[key];
                }
                return acc;
            }, {});
        });

        res.status(200).json(filteredUserVehicles);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal server error" });
    }
};



// Update Vehicle details
const updateVehicleDetails = async (req, res) => {
    const { vehicleId } = req.params;
    const editables = ["vehicle_make", "vehicle_model", "number_plate", "vehicle_color", "vehicle_type"];
    
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
        const vehicleExists = await vehicles.query().where({ id: vehicleId }).first();
        if (!vehicleExists) {
          return res.status(404).json({ message: "Failed! vehicle does not exist!" });
        }
    if (req.body.number_plate) {
      const numberPlateExists = await vehicles.query().where({ number_plate: req.body.number_plate }).first();
      if (numberPlateExists && numberPlateExists.id != vehicleId) {
        return res.status(400).json({ message: "Number plate already exists!" });
      }
    }
    
      await vehicles.query().patch(updates).where({ id: vehicleId });
      res.status(200).json({ message: "Vehicle updated successfully!" });

    
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  //Delete vehicle
  const deleteVehicleById = async (req,res) => {
    const {vehicleid} = req.params;

    try{
        //check if vehicle exists
        const vehicleExists = await vehicles.query().findById (vehicleid);
        if(!vehicleExists) {
            return res.status(404).json({ message: "Vehicle not found" });
        }
    
        // Delete the vehicle
        await vehicles.query().deleteById(vehicleid);
        res.status(200).json({ message: "Vehicle deleted successfully" });

      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
      }
    };


module.exports = {
    createVehicle,
    getVehiclesById,
    getAllVehicles,
    updateVehicleDetails,
    deleteVehicleById,
    getVehiclesByUserId

}

//update vehicles
