const { response } = require('express');
const houses = require('./houses.model');
const { error } = require('console');

const createHouses = async (req, res) => {
    const {
        house_type_id,
        status_id,
        house_number,
        description,
        created_at,
        created_by,
        house_id,
        phase_id,
        estate_id,
        block_id
    } = req.body;

    const requiredAttributes = ['house_number', 'description', 'created_by'];
    const missingAttributes = requiredAttributes.filter(attr => !req.body[attr]);

    if (missingAttributes.length > 0) {
        return res.status(400).json({
            message: "Missing attributes: " + missingAttributes.join(',')
        });
    }

    // ✅ Ensure at least one of house_id, phase_id, or estate_id is provided
    if (!block_id && !phase_id && !estate_id ) {
        return res.status(400).json({
            message: "Please provide at least one of: block_id, phase_id, or estate_id."
        });
    }

    try {
        // ✅ Check if house with same number already exists (within same house, phase, or estate)
        const houseExists = await houses.query()
            .where({ house_number })
            .modify((query) => {
                if (block_id) query.andWhere('block_id', block_id);
                else if (phase_id) query.andWhere('phase_id', phase_id);
                else query.andWhere('estate_id', estate_id);
            })
            .first();

        if (houseExists) {
            return res.status(400).send({
                message: "Failed. House already exists in this location!"
            });
        }

        const newHouse = await houses.query().insert({
            house_number,
            house_type_id,
            status_id,
            description,
            created_at,
            created_by,
            house_id,
            phase_id,
            estate_id,
            block_id
        });

        res.status(200).json({
            message: "Added successfully.",
            data: { ...newHouse}
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating house: ' + error.message);
    }
};

//Get  by Id
const getHousesById = async (req, res) => {
    const { Id } = req.params;

    try {
        const house = await houses.query().findById(Id);

        if (!house) {
            return res.status(404).json({ error: 'Not found' });
        }

        //List of keys to remove
        const keysToRemove = ['created_at', 'upadated_at'];

        //Object to without keys
        const filteredhouse = Object.keys(house).reduce((acc, key) => {
            if (!keysToRemove.includes(key)) {
                acc[key] = house[key];
            }
            return acc;
        }, {});
        res.status(200).json(filteredhouse);
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            message: "Internal server error"
        });
    }
}

//get all 
const getAllHouses = async (req, res) => {

    try {
        const allHouses = await houses.query();

        res.status(200).json(allHouses);

    } catch (error) {
        return res.status(500).send({
            message: "internal server error."
        });
    }
}
//Get by location
const getHousesByLocation = async (req, res) => {
    const { block_id, phase_id, estate_id } = req.query;

    // Check if at least one parameter is provided
    if (!block_id && !phase_id && !estate_id) {
        return res.status(400).json({
            message: "Please provide at least one of: block_id, phase_id, or estate_id."
        });
    }

    try {
        const query = houses.query();

        // Add query conditions only for defined parameters
        if (block_id) query.where('block_id', block_id);
        if (phase_id) query.where('phase_id', phase_id);
        if (estate_id) query.where('estate_id', estate_id);

        // Execute the query
        const userHouses = await query;

        // If no houses are found
        if (!userHouses || userHouses.length === 0) {
            return res.status(404).json({ message: 'No houses found for this location.' });
        }

        // Remove unnecessary keys
        const keysToRemove = ['created_at', 'updated_at'];
        const filteredHouses = userHouses.map(house => {
            return Object.keys(house).reduce((acc, key) => {
                if (!keysToRemove.includes(key)) {
                    acc[key] = house[key];
                }
                return acc;
            }, {});
        });

        return res.status(200).json(filteredHouses);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error." });
    }
};





// Update details
const updateHouseDetails = async (req, res) => {
    const { Id } = req.params;
    const editables = ["house_number", "house_type_id","status_id","block_id","phase_id","estate_id","description"];

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
        const houseExists = await houses.query().where({ id: Id }).first();
        if (!houseExists) {
            return res.status(404).json({ message: "Failed! Does not exist!" });
        }
        if (req.body.house_number) {
            const house_numberExists = await houses.query().where({ house_number: req.body.house_number }).first();
            if (house_numberExists && house_numberExists.id != Id) {
                return res.status(400).json({ message: "Already exists!" });
            }
        }

        await houses.query().patch(updates).where({ id: Id });
        res.status(200).json({ message: "Updated successfully!" });


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//Delete 
const deleteHousesById = async (req, res) => {
    const { Id } = req.params;

    try {
        //check if  exists
        const houseExists = await houses.query().findById(Id);
        if (!houseExists) {
            return res.status(404).json({ message: "Not found" });
        }

        // Delete 
        await houses.query().deleteById(Id);
        res.status(200).json({ message: "Deleted successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


module.exports = {
    createHouses,
    getHousesById,
    getAllHouses,
    updateHouseDetails,
    deleteHousesById,
    getHousesByLocation,

}

//update houses
