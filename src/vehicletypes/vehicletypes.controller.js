const vehicletypes = require('./vehicletypes.model');



//create  : add created by in req.body
const create = async (req, res) => {
    const { type } = req.body;
    const requiredAttributes = ['type'];
    const missingAttributes = requiredAttributes.filter(attr => !req.body[attr]);

    if (missingAttributes.length > 0) {
        return res.status(400).json({
            "Missing attributes": missingAttributes.join(',')
        });
      }

    try {

        //check if  exists for verification
    
        const vehicleType = await vehicletypes.query()
            .where({type}).first();

        if (vehicleType) {
            return res.status(400).send({
                message: "Failed.User type already exist !"
            });
        }
        const newVehicleType = await vehicletypes.query().insert({ type });
        res.status(200).json({
            message: "Added successfully.",
            data: {
                type: newVehicleType.type,
              
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating user type: ' + error.message);
    }
};

//Get u type by Id
const getById = async (req, res) => {
    const { id } = req.params;

    try {
        const vehicleType = await vehicletypes.query().findById(id);
        if (vehicleType) {
            res.status(200).json(vehicleType);
        }

        if (!vehicleType) {
            return res.status(404).json({ erro: 'Type not found' });
        }

        //List of keys to remove
        const keysToRemove = ['created_at', 'updated_at','created_by'];

        //Object to without keys
        const filteredVehicleType = Object.keys(vehicleType).reduce((acc, key) => {
            if (!keysToRemove.includes(key)) {
                acc[key] = vehicleType[key];
            }
            return acc;
        }, {});
        res.status(200).json(filteredVehicleType);

    } catch (error) {
        console.log (error)
        return res.status(500).send({
            message: "Internal server error"
        });
    }
}

//get all user types
const getAll = async (req, res) => {

    try {
        const getAllTypes = await vehicletypes.query();

        res.status(200).json(getAllTypes);

    } catch (error) {
        return res.status(500).send({
            message: "internal server error."
        });
    }
}


// Update  user type details
const updateVehicleTypes = async (req, res) => {
    const { vehicletypeid } = req.params;
    const editables = ["type"];
    
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

    
    if (req.body.type) {
      const vehicleType = await vehicletypes.query().where({ type: req.body.type }).first();
      if (vehicleType) {
        return res.status(400).json({ message: "Already exists!" });
      }
    }
    
    try {
      const vehicleType = await vehicletypes.query().where({ id: vehicletypeid }).first();
      if (!vehicleType) {
        return res.status(404).json({ message: "Failed! Does not exist!" });
      }
  
      await vehicletypes.query().patch(updates).where({ id: vehicletypeid });
      res.status(200).json({ message: "Updated successfully!" });

    
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  //Delete vehicletypes
  const deleteVehicleType = async (req,res) => {
    const {vehicletypeid} = req.params;

    try{
        //check if vehicleType exists
        const vehicleType = await vehicletypes.query().findById (vehicletypeid);
        if(!vehicleType) {
            return res.status(404).json({ message: "User type not found" });
        }
    
        // Delete the user type
        await vehicletypes.query().deleteById(vehicletypeid);
        res.status(200).json({ message: "User type deleted successfully" });

      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
      }
    };


module.exports = {
  create,
  updateVehicleTypes,
  getAll,
  getById,
  deleteVehicleType
}



