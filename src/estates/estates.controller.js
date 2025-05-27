const { response } = require('express');
const estates = require('./estates.model');
const { error } = require('console');

//create estate
const createEstate = async (req, res) => {
    const { name,town_id, address, created_at,created_by } = req.body;
    const requiredAttributes = ['name','town_id','address','created_by'];
    const missingAttributes = requiredAttributes.filter(attr => !req.body[attr]);

    if (missingAttributes.length > 0) {
        return res.status(400).json({
            "Missing attributes": missingAttributes.join(',')
        });

    }

    try {

        //check if estate exists verification

        const estateExists = await estates.query()
            .where({
                name: name
            }).first();

        if (estateExists) {
            return res.status(400).send({
                message: "Failed.Esate already exist !"
            });
        }
        const newEstate = await estates.query().insert({ name,town_id: parseInt(town_id), created_at, created_by: parseInt(created_by),address });
        res.status(200).json({
            
            message: "Estate added successfully.",
            data: {
                name: newEstate.name,
                town_id: newEstate.town_id,
                address: newEstate.address,
                created_by:newEstate.created_by
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating estate: ' + error.message);
    }
};

//Get estate by Id
const getEstateById = async (req, res) => {
    const { Id } = req.params;

    try {
        const estate = await estates.query().findById(Id);

        if (!estate) {
            return res.status(404).json({ error: 'estate not found' });
        }

        //List of keys to remove
        const keysToRemove = ['created_at', 'created_by'];

        //Object to without keys
        const filteredEstate = Object.keys(estate).reduce((acc, key) => {
            if (!keysToRemove.includes(key)) {
                acc[key] = estate[key];
            }
            return acc;
        }, {});
        res.status(200).json(filteredEstate);
    } catch (error) {
        console.log (error)
        return res.status(500).send({
            message: "Internal server error"
        });
    }
}

//get all estates
const getAllEstates = async (req, res) => {

    try {
        const allEstates = await estates.query();

        res.status(200).json(allEstates);

    } catch (error) {
        return res.status(500).send({
            message: "internal server error."
        });
    }
}
//get estates by user id
const getEstatesByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const userEstates = await estates.query().where({ created_by: userId });

        if (!userEstates || userEstates.length === 0) {
            return res.status(404).json({ error: 'No estates found for this user' });
        }

        const keysToRemove = ['created_at', 'updated_at'];
        const filteredUserEstates = userEstates.map(estate => {
            return Object.keys(estate).reduce((acc, key) => {
                if (!keysToRemove.includes(key)) {
                    acc[key] = estate[key];
                }
                return acc;
            }, {});
        });

        return res.status(200).json(filteredUserEstates);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal server error" });
    }
};



// Update estate details
const updateEstateDetails = async (req, res) => {
    const { Id } = req.params;
    const editables = ["name", "town_id", "address"];
    
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
        const estateExists = await estates.query().where({ id: Id }).first();
        if (!estateExists) {
          return res.status(404).json({ message: "Failed! estate does not exist!" });
        }
    if (req.body.name) {
      const nameExists = await estates.query().where({ name: req.body.name}).first();
      if (nameExists && nameExists.id != Id) {
        return res.status(400).json({ message: "Estate already exists!" });
      }
    }
    
      await estates.query().patch(updates).where({ id: Id });
      res.status(200).json({ message: "Estate updated successfully!" });

    
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  //Delete 
  const deleteEstateById = async (req,res) => {
    const {Id} = req.params;

    try{
        //check if  exists
        const estateExists = await estates.query().findById (Id);
        if(!estateExists) {
            return res.status(404).json({ message: "Not found" });
        }
    
        // Delete 
        await estates.query().deleteById(Id);
        res.status(200).json({ message: "Deleted successfully" });

      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
      }
    };


module.exports = {
    createEstate,
    getEstateById,
    getAllEstates,
    updateEstateDetails,
    deleteEstateById,
    getEstatesByUserId,

}

//update estates
