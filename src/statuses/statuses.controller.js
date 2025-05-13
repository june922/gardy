const statuses = require('./statuses.model');



//create statuses : add created by in req.body
const createStatus = async (req, res) => {
    const { name,status_for,description,created_at } = req.body;
    const requiredAttributes = ['name','status_for'];
    const missingAttributes = requiredAttributes.filter(attr => !req.body[attr]);

    if (missingAttributes.length > 0) {
        return res.status(400).json({
            "Missing attributes": missingAttributes.join(',')
        });

    }

    try {

        //check if  exists verification
        const userStatus = await statuses.query()
            .where({name}).first();

        if (userStatus) {
            return res.status(400).send({
                message: "Failed.Already exist !"
            });
        }
        const newUserStatus = await statuses.query().insert({ name,status_for,description,created_at });
        if (!newUserStatus) {
            return res.status(400).json({
                message: "Failed to create user status."
            });
        }
        res.status(200).json({
            message: "Added successfully.",
            data: {
                name: newUserStatus.name,
                status_for:newUserStatus. status_for,
                description:newUserStatus.description,
                created_at:newUserStatus.created_at,
              
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating user status: ' + error.message);
    }
};

//Get  by Id
const getStatusById = async (req, res) => {
    const { statusid } = req.params;

    try {
        const userStatus = await statuses.query().findById(statusid);
        if (userStatus) {
            res.status(200).json(userStatus);
        }

        if (!userStatus) {
            return res.status(404).json({ erro: ' Not found' });
        }

        //List of keys to remove
        const keysToRemove = ['created_at'];

        //Object to without keys
        const filteredUserStatus = Object.keys(userStatus).reduce((acc, key) => {
            if (!keysToRemove.includes(key)) {
                acc[key] = userStatus[key];
            }
            return acc;
        }, {});
        res.status(200).json(filteredUserStatus);

    } catch (error) {
        console.log (error)
        return res.status(500).send({
            message: "Internal server error"
        });
    }
}

const getAllStatuses = async (req, res) => {
  try {
    const getStatus = await statuses.query();

    if (!getStatus || getStatus.length === 0) {
      return res.status(404).json({ message: "No statuses found" });
    }

    return res.status(200).json(getStatus); // ✅ Send the response
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      message: "Internal server error."
    });
  }
};


// Update  details
const updateStatus = async (req, res) => {
    const { statusid } = req.params;
    const editables = ["name","status_for", "description"];
    
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
      const userStatus = await statuses.query().where({ name: req.body.name }).first();
      if (userStatus) {
        return res.status(400).json({ message: "Already exists!" });
      }
    }
    
    try {
      const userStatus = await statuses.query().where({ id: statusid }).first();
      if (!userStatus) {
        return res.status(404).json({ message: "Failed! Does not exist!" });
      }
  
      await statuses.query().patch(updates).where({ id: statusid });
      res.status(200).json({ message: "Updated successfully!" });

    
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  //Delete statuses
  const deleteStatusById = async (req,res) => {
    const {statusid} = req.params;

    try{
        //check if userStatus exists
        const userStatus = await statuses.query().findById (statusid);
        if(!userStatus) {
            return res.status(404).json({ message: "Not found" });
        }
    
        // Delete the status
        await statuses.query().deleteById(statusid);
        res.status(200).json({ message: "Deleted successfully" });

      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
      }
    };


module.exports = {
  createStatus,
  updateStatus,
  getAllStatuses,
  getStatusById,
  deleteStatusById
}



