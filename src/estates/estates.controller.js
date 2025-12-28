const { response } = require('express');
const estates = require('./estates.model');
const { error } = require('console');

//create estate
const createEstate = async (req, res) => {
    const { name, town_id, address, created_at, created_by } = req.body;
    const requiredAttributes = ['name', 'town_id', 'address', 'created_by'];
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
                name: name,
                town_id: town_id
            }).first();

        if (estateExists) {
            return res.status(400).send({
                message: "Failed. Estate already exists!"
            });
        }

        const newEstate = await estates.query().insert({ 
            name, 
            town_id: parseInt(town_id), 
            created_at, 
            created_by: parseInt(created_by), 
            address 
        });

        // Fetch the estate with town relation
        const estateWithTown = await estates.query()
            .findById(newEstate.id)
            .withGraphFetched('town');

        res.status(200).json({
            message: "Estate added successfully.",
            data: {
                ...estateWithTown,
                town_name: estateWithTown.town ? estateWithTown.town.name : null // Adjust 'name' to match your Town model's name field
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
        const estate = await estates.query()
            .findById(Id)
            .withGraphFetched('town');

        if (!estate) {
            return res.status(404).json({ error: 'Estate not found' });
        }

        //List of keys to remove
        const keysToRemove = ['created_at', 'created_by'];

        //Object without keys
        const filteredEstate = Object.keys(estate).reduce((acc, key) => {
            if (!keysToRemove.includes(key)) {
                acc[key] = estate[key];
            }
            return acc;
        }, {});

        // Add town_name to the response
        filteredEstate.town_name = estate.town ? estate.town.name : null; // Adjust 'name' to match your Town model's name field

        res.status(200).json(filteredEstate);
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: "Internal server error"
        });
    }
}

//get all estates
const getAllEstates = async (req, res) => {
    try {
        const allEstates = await estates.query()
            .withGraphFetched('town');

        // Add town_name to each estate
        const estatesWithTownName = allEstates.map(estate => ({
            ...estate,
            town_name: estate.town ? estate.town.name : null // Adjust 'name' to match your Town model's name field
        }));

        res.status(200).json(estatesWithTownName);
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "Internal server error."
        });
    }
}

//get estates by user id
const getEstatesByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const userEstates = await estates.query()
            .where({ created_by: userId })
            .withGraphFetched('town');

        if (!userEstates || userEstates.length === 0) {
            return res.status(404).json({ error: 'No estates found for this user' });
        }

        const keysToRemove = ['created_at', 'updated_at'];
        const filteredUserEstates = userEstates.map(estate => {
            const filteredEstate = Object.keys(estate).reduce((acc, key) => {
                if (!keysToRemove.includes(key)) {
                    acc[key] = estate[key];
                }
                return acc;
            }, {});

            // Add town_name to each estate
            filteredEstate.town_name = estate.town ? estate.town.name : null; // Adjust 'name' to match your Town model's name field

            return filteredEstate;
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
            return res.status(404).json({ message: "Failed! Estate does not exist!" });
        }

        if (req.body.name) {
            const nameExists = await estates.query()
                .where({ name: req.body.name, town_id: estateExists.town_id })
                .whereNot('id', Id)
                .first();
            if (nameExists) {
                return res.status(400).json({ message: "Estate with this name already exists in this town!" });
            }
        }
    
        await estates.query().patch(updates).where({ id: Id });

        // Fetch updated estate with town relation
        const updatedEstate = await estates.query()
            .findById(Id)
            .withGraphFetched('town');

        res.status(200).json({ 
            message: "Estate updated successfully!",
            data: {
                ...updatedEstate,
                town_name: updatedEstate.town ? updatedEstate.town.name : null
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//Delete 
const deleteEstateById = async (req, res) => {
    const { Id } = req.params;

    try {
        // Check if estate exists
        const estateExists = await estates.query()
            .findById(Id)
            .withGraphFetched('town');

        if (!estateExists) {
            return res.status(404).json({ message: "Not found" });
        }

        // Store estate info before deletion for response
        const estateInfo = {
            ...estateExists,
            town_name: estateExists.town ? estateExists.town.name : null
        };
    
        // Delete estate
        await estates.query().deleteById(Id);
        
        res.status(200).json({ 
            message: "Deleted successfully",
            deleted_estate: estateInfo
        });
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