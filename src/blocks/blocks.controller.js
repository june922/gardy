const { response } = require('express');
const blocks = require('./blocks.model');
const { error } = require('console');
const estates = require('../estates/estates.model');

//create
const createBlocks = async (req, res) => {
    const { name, estate_id, description, created_at, created_by } = req.body;
    const requiredAttributes = ['name', 'estate_id', 'created_by'];
    const missingAttributes = requiredAttributes.filter(attr => !req.body[attr]);

    if (missingAttributes.length > 0) {
        return res.status(400).json({
            "Missing attributes": missingAttributes.join(',')
        });
    }

    try {
        // Check if the estate exists
        const estateExists = await estates.query()
            .where({ id: estate_id })
            .first();

        if (!estateExists) {
            return res.status(400).send({
                message: "Failed. The specified estate does not exist!"
            });
        }

        //check if exists verification
        const blockExists = await blocks.query()
            .where({
                name: name,
                estate_id: estate_id
            }).first();

        if (blockExists) {
            return res.status(400).send({
                message: "Failed. Block with this name already exists in this estate!"
            });
        }
        const newBlock = await blocks.query().insert({ name, estate_id, created_at, created_by, description });
        res.status(200).json({
            message: "Added successfully.",
            data: { ...newBlock }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating block: ' + error.message);
    }
};

//Get  by Id
const getBlocksById = async (req, res) => {
    const { Id } = req.params;

    try {
        const block = await blocks.query().findById(Id);

        if (!block) {
            return res.status(404).json({ error: 'Not found' });
        }

        //List of keys to remove
        const keysToRemove = ['created_at', 'upadated_at'];

        //Object to without keys
        const filteredBlock = Object.keys(block).reduce((acc, key) => {
            if (!keysToRemove.includes(key)) {
                acc[key] = block[key];
            }
            return acc;
        }, {});
        res.status(200).json(filteredBlock);
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            message: "Internal server error"
        });
    }
}

//get all 
const getAllBlocks = async (req, res) => {

    try {
        const allBlocks = await blocks.query();

        res.status(200).json(allBlocks);

    } catch (error) {
        return res.status(500).send({
            message: "internal server error."
        });
    }
}
const getBlocksByEstateId = async (req, res) => {
    const { estateId } = req.params;

    try {
        const userBlocks = await blocks.query().where({ estate_id: estateId });

        if (!userBlocks || userBlocks.length === 0) {
            return res.status(404).json({ error: 'No blocks found for this estate' });
        }

        const keysToRemove = ['created_at', 'updated_at'];
        const filteredUserBlocks = userBlocks.map(block => {
            return Object.keys(block).reduce((acc, key) => {
                if (!keysToRemove.includes(key)) {
                    acc[key] = block[key];
                }
                return acc;
            }, {});
        });

        return res.status(200).json(filteredUserBlocks);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal server error" });
    }
};



// Update estate details
const updateBlocksDetails = async (req, res) => {
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
        const blockExists = await blocks.query().where({ id: Id }).first();
        if (!blockExists) {
            return res.status(404).json({ message: "Failed! Does not exist!" });
        }
        if (req.body.name && req.body.name !== blockExists.name) {
            const nameExists = await blocks.query()
                .where({ name: req.body.name, estate_id: blockExists.estate_id })
                .whereNot('id', Id)
                .first();
            if (nameExists) {
                return res.status(400).json({ message: "Block with this name already exists in this estate!" });
            }
        }

        await blocks.query().patch(updates).where({ id: Id });
        res.status(200).json({ message: "Updated successfully!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//Delete 
const deleteBlocksById = async (req, res) => {
    const { Id } = req.params;

    try {
        //check if  exists
        const blockExists = await blocks.query().findById(Id);
        if (!blockExists) {
            return res.status(404).json({ message: "Not found" });
        }

        // Delete 
        await blocks.query().deleteById(Id);
        res.status(200).json({ message: "Deleted successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


module.exports = {
    createBlocks,
    getBlocksById,
    getAllBlocks,
    updateBlocksDetails,
    deleteBlocksById,
    getBlocksByEstateId,

}

//update blocks
