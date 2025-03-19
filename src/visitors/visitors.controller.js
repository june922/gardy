
const users = require('../users/users.model');
const visitortypes = require('../visitortypes/visitortypes.model');
const visitors = require('./visitors.model');
const moment = require('moment');

const createVisitor = async (req, res) => {
  try {
    let { visitor_name, phone_no, vehicle_plate, tenant_id, expected_date, remarks, visitor_type_id, national_id, expected_time } = req.body;

    // Ensure `expected_date` is properly formatted (if it's a string)
    if (expected_date) {
      expected_date = moment(expected_date, 'YYYY-MM-DD').format('YYYY-MM-DD');
    }

    // Ensure `expected_time` is properly formatted (if it's a string)
    if (expected_time) {
      expected_time = moment(expected_time, 'HH:mm').format('HH:mm:ss'); // Converts to HH:MM:SS
    }

    // Insert the new visitor into the database
    const newVisitor = await visitors.query().insert({
      visitor_name,
      phone_no,
      national_id:parseInt(national_id),
      vehicle_plate,
      tenant_id,
      expected_date,
      expected_time,
      remarks,
      visitor_type_id,
    });

    // Return the created visitor details
    res.status(201).json({
      message: "Visitor Created Successfully.",
      data: {
        visitor_name: newVisitor.visitor_name,
        national_id: newVisitor.national_id,
        phone_no: newVisitor.phone_no,
        vehicle_plate: newVisitor.vehicle_plate,
        tenant_id: newVisitor.tenant_id,
        expected_date: newVisitor.expected_date,
        expected_time: newVisitor.expected_time,
        visitor_type_id: newVisitor.visitor_type_id,
        remarks: newVisitor.remarks,
      },
    });
  } catch (error) {
    console.error("Error creating visitor:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


///get all visitors
const getAllVisitors = async (req, res) => {

  try {
      const allVisitors = await visitors.query();

      res.status(200).json(allVisitors);

  } catch (error) {
      return res.status(500).send({
          message: "internal server error."
      });
  }
}
// Assuming you have a model to interact with your database
const getVisitorsByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const userVisitors = await visitors.query().where({ tenant_id: userId });

    if (!userVisitors || userVisitors.length === 0) {
      return res.status(404).json({ error: 'No visitors found for this user.' });
    }

    res.status(200).json(userVisitors);
  } catch (error) {
    console.error("Error fetching visitors by user ID:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

//Get visitor by Id

const getVisitorById = async (req, res) => {
  const { id } = req.params;

  try {
      const visitor = await visitors.query().findById(id);

      if (!visitor) {
          return res.status(404).json({ error: 'Visitor not found' });
      }

      //List of keys to remove
      const keysToRemove = ['created_at', 'updated_at'];

      //Object to without keys
      const filteredVisitor = Object.keys(visitor).reduce((acc, key) => {
          if (!keysToRemove.includes(key)) {
              acc[key] = visitor[key];
          }
          return acc;
      }, {});
      res.status(200).json(filteredVisitor);
  } catch (error) {
     
      return res.status(500).send({
          message: "Internal server error"
      });
  }
}
// Update Visitor details
const updateVisitorDetails = async (req, res) => {
  const { visitorId } = req.params;
  const editables = [
    "visitor_name", "phone_no", "vehicle_plate", "tenant_id",
    "expected_date", "remarks", "visitor_type_id", "national_id", "expected_time"
  ];

  // Check for invalid keys
  const invalidKeys = Object.keys(req.body).filter(key => !editables.includes(key));
  if (invalidKeys.length > 0) {
    return res.status(400).json({ error: `Not allowed: ${invalidKeys.join(', ')}` });
  }

  // Extract values from req.body
  let { expected_date, expected_time } = req.body;
  const updates = {};

  // Format expected_date and expected_time if provided
  if (expected_date) {
    updates.expected_date = moment(expected_date, 'YYYY-MM-DD').format('YYYY-MM-DD');
  }
  if (expected_time) {
    updates.expected_time = moment(expected_time, 'HH:mm').format('HH:mm:ss'); // Converts to HH:MM:SS
  }

  // Add only valid updates
  for (const key of Object.keys(req.body)) {
    if (req.body[key] && key !== "expected_date" && key !== "expected_time") {
      updates[key] = req.body[key];
    }
  }

  // Check if updates object is empty
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid updates provided' });
  }

  try {
    // Check if visitor exists
    const visitorExists = await visitors.query().where({ id: visitorId }).first();
    if (!visitorExists) {
      return res.status(404).json({ message: "Failed! Visitor does not exist!" });
    }

    // Update visitor details
    await visitors.query().patch(updates).where({ id: visitorId });
    res.status(200).json({ message: "Visitor updated successfully!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


//Delete visitors
const deleteVisitorsById = async (req,res) => {
  const {visitorid} = req.params;

  try{
      //check if visitor exists
      const visitorExists = await visitors.query().findById (visitorid);
      if(!visitorExists) {
          return res.status(404).json({ message: "Visitor not found" });
      }
  
      // Delete the vehicle
      await visitors.query().deleteById(visitorid);
      res.status(200).json({ message: "Visitor deleted successfully" });

    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };


module.exports = {
  createVisitor,
getAllVisitors,
getVisitorsByUserId,
getVisitorById,
deleteVisitorsById,
updateVisitorDetails,

}

