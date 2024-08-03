const visitortypes = require('./visitortypes.model');


//create visitor type : add created by in req.body
const createVisitorTypes = async (req, res) => {
    const { name } = req.body;
    const requiredAttributes = ['name'];
    const missingAttributes = requiredAttributes.filter(attr => !req.body[attr]);

    if (missingAttributes.length > 0) {
        return res.status(400).json({
            "Missing attributes": missingAttributes.join(',')
        });

    }

    try {

        //check if visitor type exists verification
    
        const visitorTypeExists = await visitortypes.query()
            .where({name}).first();

        if (visitorTypeExists) {
            return res.status(400).send({
                message: "Failed.Visitor type already exist !"
            });
        }
        const newVisitorType = await visitortypes.query().insert({ name });
        res.status(200).json({
            message: "Visitor type added successfully.",
            data: {
                visitortype: newVisitorType.name,
              
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating user: ' + error.message);
    }
};

//Get visitor type by Id
const getVisitorTypeById = async (req, res) => {
    const { visitortypesid } = req.params;

    try {
        const visitorType = await visitortypes.query().findById(visitortypesid);
        if (visitorType) {
            res.status(200).json(visitorType);
        }

        if (!visiorType) {
            return res.status(404).json({ erro: 'Visitor type not found' });
        }

        //List of keys to remove
        const keysToRemove = ['created_at', 'updated_at','created_by'];

        //Object to without keys
        const filteredVisitorType = Object.keys(visitorType).reduce((acc, key) => {
            if (!keysToRemove.includes(key)) {
                acc[key] = visitorType[key];
            }
            return acc;
        }, {});
        res.status(200).json(filteredVisitorType);
    } catch (error) {
        console.log (error)
        return res.status(500).send({
            message: "Internal server error"
        });
    }
}

//get all visitor types
const getAllVisitorTypes = async (req, res) => {

    try {
        const getVisitorTypes = await visitortypes.query();

        res.status(200).json(getVisitorTypes);

    } catch (error) {
        return res.status(500).send({
            message: "internal server error."
        });
    }
}


// Update  visitor type details
const updateVisitorTypes = async (req, res) => {
    const { visitortypesid } = req.params;
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
      const visitorTypeExists = await visitortypes.query().where({ name: req.body.name }).first();
      if (visitorTypeExists) {
        return res.status(400).json({ message: "visitor type already exists!" });
      }
    }
    
    try {
      const visitorTypeExists = await visitortypes.query().where({ id: visitortypesid }).first();
      if (!visitorTypeExists) {
        return res.status(404).json({ message: "Failed! Does not exist!" });
      }
  
      await visitortypes.query().patch(updates).where({ id: visitortypesid });
      res.status(200).json({ message: "Updated successfully!" });

    
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  //Delete visitortypes
  const deleteVisitorTypesById = async (req,res) => {
    const {visitortypesid} = req.params;

    try{
        //check if visitorType exists
        const visitorTypeExists = await visitortypes.query().findById (visitortypesid);
        if(!visitorTypeExists) {
            return res.status(404).json({ message: "Visitor type not found" });
        }
    
        // Delete the visitor type
        await visitortypes.query().deleteById(visitortypesid);
        res.status(200).json({ message: "Visitor type deleted successfully" });

      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
      }
    };


module.exports = {
    createVisitorTypes,
    getAllVisitorTypes,
    getVisitorTypeById,
    updateVisitorTypes,
    deleteVisitorTypesById

}



