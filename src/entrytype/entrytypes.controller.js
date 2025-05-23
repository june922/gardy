const entrytypes = require('./entrytypes.model');



//create 
const create = async (req, res) => {
    const { type,created_at,updated_at,created_by } = req.body;
    const requiredAttributes = ['type'];
    const missingAttributes = requiredAttributes.filter(attr => !req.body[attr]);

    if (missingAttributes.length > 0) {
        return res.status(400).json({
            "Missing attributes": missingAttributes.join(',')
        });
    }

    try {

        //check if type exists verification
    
        const typeExists = await entrytypes.query()
            .where({type}).first();

        if (typeExists) {
            return res.status(400).send({
                message: "Failed.Already exist !"
            });
        };

        const newType = await entrytypes.query().insert({
            type,
          created_by,
          created_at,
          updated_at
        });

        // Return the created type details
        res.status(200).json({
            message: " Added successfully.",
            data: {
               ...newType }
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating  type: ' + error.message);
    }
};

//Get type by Id
const getTypeById = async (req, res) => {
    const { entrytypeid } = req.params;

    try {
        const entryType = await entrytypes.query().findById(entrytypeid);
        if (entryType) {
            res.status(200).json(entryType);
        }

        if (!entryType) {
            return res.status(404).json({ erro: 'Type not found' });
        }

        //List of keys to remove
        const keysToRemove = ['created_at', 'updated_at','created_by'];

        //Object to without keys
        const filteredEntryType = Object.keys(entryType).reduce((acc, key) => {
            if (!keysToRemove.includes(key)) {
                acc[key] = entryType[key];
            }
            return acc;
        }, {});
        res.status(200).json(filteredEntryType);

    } catch (error) {
        console.log (error)
        return res.status(500).send({
            message: "Internal server error"
        });
    }
}

//get all  types
const getAllEntryType = async (req, res) => {

    try {
        const getEntryType = await entrytypes.query();

        res.status(200).json(getEntryType);

    } catch (error) {
        return res.status(500).send({
            message: "internal server error."
        });
    }
}
//update type
 const updateEntryType = async (req, res) => {
    const { entrytypeid } = req.params;
    const { type, updated_at, created_by } = req.body;

    try {
        // Check if the type exists
        const typeExists = await entrytypes.query().findById(entrytypeid);

        if (!typeExists) {
            return res.status(404).json({ message: "Type not found." });
        }

        // Update the type
        await entrytypes.query().patch({
            type,
            updated_at,
            created_by
        }).where({ id: entrytypeid });

        res.status(200).json({ message: "Updated successfully!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}





module.exports = {
  create,
  getAllEntryType,
  getTypeById,
 updateEntryType
}



