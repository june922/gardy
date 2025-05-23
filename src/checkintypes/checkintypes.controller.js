const checkintypes = require('./checkintypes.model');



//create checkintypes : add created by in req.body
const create = async (req, res) => {
    const { name,created_at,updated_at,created_by } = req.body;
    const requiredAttributes = ['name'];
    const missingAttributes = requiredAttributes.filter(attr => !req.body[attr]);

    if (missingAttributes.length > 0) {
        return res.status(400).json({
            "Missing attributes": missingAttributes.join(',')
        });

    }

    try {

        //check if type exists verification
    
        const typeExists = await checkintypes.query()
            .where({name}).first();

        if (typeExists) {
            return res.status(400).send({
                message: "Failed.Already exist !"
            });
        }
        const newType = await checkintypes.query().insert({ name });
        res.status(200).json({
            message: "User type added successfully.",
            data: {
                checkinType: newType.name,
              
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating  type: ' + error.message);
    }
};

//Get type by Id
const getTypeById = async (req, res) => {
    const { checkintypeid } = req.params;

    try {
        const checkinType = await checkintypes.query().findById(checkintypeid);
        if (checkinType) {
            res.status(200).json(checkinType);
        }

        if (!checkinType) {
            return res.status(404).json({ erro: 'User type not found' });
        }

        //List of keys to remove
        const keysToRemove = ['created_at', 'updated_at','created_by'];

        //Object to without keys
        const filteredCheckinType = Object.keys(checkinType).reduce((acc, key) => {
            if (!keysToRemove.includes(key)) {
                acc[key] = checkinType[key];
            }
            return acc;
        }, {});
        res.status(200).json(filteredCheckinType);

    } catch (error) {
        console.log (error)
        return res.status(500).send({
            message: "Internal server error"
        });
    }
}

//get all  types
const getAllCheckinTypes = async (req, res) => {

    try {
        const getCheckinType = await checkintypes.query();

        res.status(200).json(getCheckinType);

    } catch (error) {
        return res.status(500).send({
            message: "internal server error."
        });
    }
}


// Update  u type details
const updateCheckinType = async (req, res) => {
    const { checkintypeid } = req.params;
    const editables = ["name"];
    
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

    
    if (req.body.name) {
      const typeExists = await checkintypes.query().where({ name: req.body.name }).first();
      if (typeExists) {
        return res.status(400).json({ message: "Already exists!" });
      }
    }
    
    try {
      const typeExists = await checkintypes.query().where({ id: checkintypeid }).first();
      if (!typeExists) {
        return res.status(404).json({ message: "Failed! Does not exist!" });
      }
  
      await checkintypes.query().patch(updates).where({ id: checkintypeid });
      res.status(200).json({ message: "Updated successfully!" });

    
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  //Delete checkintypes
  const deletecheckinTypeById = async (req,res) => {
    const {checkintypeid} = req.params;

    try{
        //check if checkinType exists
        const typeExists = await checkintypes.query().findById (checkintypeid);
        if(!typeExists) {
            return res.status(404).json({ message: "User type not found" });
        }
    
        // Delete the user type
        await checkintypes.query().deleteById(checkintypeid);
        res.status(200).json({ message: "User type deleted successfully" });

      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
      }
    };


module.exports = {
  create,
  updateCheckinType,
  getAllCheckinTypes,
  getTypeById,
  deletecheckinTypeById
}



