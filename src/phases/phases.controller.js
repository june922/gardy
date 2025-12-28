const { response } = require('express');
const phases = require('./phases.model');
const { error } = require('console');
const estates = require('../estates/estates.model');

//create
const createPhases = async (req, res) => {
    const { name,estate_id, description, created_at,created_by } = req.body;
    const requiredAttributes = ['name','estate_id','created_by'];
    const missingAttributes = requiredAttributes.filter(attr => !req.body[attr]);

    if (missingAttributes.length > 0) {
        return res.status(400).json({
            "Missing attributes": missingAttributes.join(',')
        });

    }

    try {
        // Check if the estate exists
        const estateExists = await estates.query()
        .where({
            id:estate_id
        }).first();

        if (!estateExists) {
            return res.status(400).send({
                message:"FailedEstate does not exist"
            });
        }

        //check if exists verification

        const phaseExists = await phases.query()
            .where({
                name: name,
                estate_id:estate_id
            }).first();

        if (phaseExists) {
            return res.status(400).send({
                message: "Failed. Already exists !"
            });
        }
        const newPhase = await phases.query().insert({ name,estate_id, created_at, created_by,description });
        res.status(200).json({
            message: "Added successfully.",
            data: { ...newPhase }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating : ' + error.message);
    }
};

//Get  by Id
const getPhasesById= async (req, res) => {
    const { Id } = req.params;

    try {
        const phase = await phases.query().findById(Id);

        if (!phase) {
            return res.status(404).json({ error: 'Not found' });
        }

        //List of keys to remove
        const keysToRemove = ['created_at', 'upadated_at'];

        //Object to without keys
        const filteredPhase = Object.keys(phase).reduce((acc, key) => {
            if (!keysToRemove.includes(key)) {
                acc[key] = phase[key];
            }
            return acc;
        }, {});
        res.status(200).json(filteredPhase);
    } catch (error) {
        console.log (error)
        return res.status(500).send({
            message: "Internal server error"
        });
    }
}

//get all phases
const getAllPhases = async (req, res) => {

    try {
        const allPhases = await phases.query();

        res.status(200).json(allPhases);

    } catch (error) {
        return res.status(500).send({
            message: "internal server error."
        });
    }
}
//get phases by estate id
const getPhasesByEstatesId = async (req, res) => {
    const { estateId } = req.params;

    try {
        const userPhases = await phases.query().where({ estate_id:estateId });

        if (!userPhases || userPhases.length === 0) {
            return res.status(404).json({ error: 'No phases found for this user' });
        }

        const keysToRemove = ['created_at', 'updated_at'];
        const filteredUserPhases = userPhases.map(phase => {
            return Object.keys(phase).reduce((acc, key) => {
                if (!keysToRemove.includes(key)) {
                    acc[key] = phase[key];
                }
                return acc;
            }, {});
        });

        return res.status(200).json(filteredUserPhases);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal server error" });
    }
};



// Update estate details
const updatePhasesDetails = async (req, res) => {
    const { Id } = req.params;
    const editables = ["name", "estate_id", "description"];
    
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
        const phaseExists = await phases.query().where({ id: Id }).first();
        if (!phaseExists) {
          return res.status(404).json({ message: "Failed! Does not exist!" });
        }

        if (req.body.name && req.body.name !== phaseExists.name) {
            const nameExists = await phases.query()
                .where({ name: req.body.name, estate_id: phaseExists.estate_id })
                .whereNot('id', Id)
                .first();
            if (nameExists) {
                return res.status(400).json({ message: "Phase with this name already exists in the estate!" });
            }
        }
    
      await phases.query().patch(updates).where({ id: Id });
      res.status(200).json({ message: "Updated successfully!" });

    
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  //Delete 
  const deletePhasesById = async (req,res) => {
    const {Id} = req.params;

    try{
        //check if  exists
        const phaseExists = await phases.query().findById (Id);
        if(!phaseExists) {
            return res.status(404).json({ message: "Not found" });
        }
    
        // Delete 
        await phases.query().deleteById(Id);
        res.status(200).json({ message: "Deleted successfully" });

      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
      }
    };


module.exports = {
    createPhases,
    getPhasesById,
    getAllPhases,
    updatePhasesDetails,
    deletePhasesById,
    getPhasesByEstatesId,

}

//update phases
