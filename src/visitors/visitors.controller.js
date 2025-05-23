
const tenants = require('../tenants/tenants.model');
const visitortypes = require('../visitortypes/visitortypes.model');
const visitors = require('./visitors.model');
const moment = require('moment');

const createVisitor = async (req, res) => {
  const { first_name,last_name, phone_number, tenant_id,house_id ,expected_date, vehicle_details, remarks, type_id, national_id, expected_time, created_at, updated_at } = req.body;
  const requiredAttributes = ['first_name','last_name' ,'phone_number','tenant_id', 'expected_date', 'type_id', 'expected_time'];
  const missingAttributes = requiredAttributes.filter(attr => !req.body[attr]);
  if (missingAttributes.length > 0) {
    return res.status(400).json({
      "Missing attributes": missingAttributes.join(',')
    });
  }

  try {
    //check if visitor type exists
    const visitorType = await visitortypes.query().findById(type_id);
    if (!visitorType) {
      return res.status(404).json({ message: "Visitor type not found." });
    }

    // Check if tenant exists`
    const tenantExists = await tenants.query().findById(tenant_id);
    if (!tenantExists) {
      return res.status(404).json({ message: "Tenant not found." });
    }

    // Format date and time without reassigning const variables
    const formattedDate = expected_date
      ? moment(expected_date).toISOString()
      : null;

      const formattedTime = expected_time
      ? moment(expected_time, ['h:mm A', 'hh:mm A', 'H:mm', 'HH:mm']).format('HH:mm:ss')
      : null;
    
    const newVisitor = await visitors.query().insert({
      first_name,
      last_name,
      house_id,
      phone_number,
      national_id,
      vehicle_details,
      tenant_id,
      expected_date: formattedDate,
      expected_time: formattedTime,
      remarks,
      type_id,
      created_at,
      updated_at
    });


    // Return the created visitor details
    res.status(201).json({
      message: "Visitor Created Successfully.",
      data: {
        ...newVisitor
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

//get by tenant_id
const getVisitorsByTenantId = async (req, res) => {
  const { tenantid } = req.params;

  try {
    // Check if tenant exists
    const tenantExists = await tenants.query().findById(tenantid);
    if (!tenantExists) {
      return res.status(404).json({ message: "Tenant not found." });
    }

    // Fetch all visitors where tenant_id matches
    const tenantVisitors = await visitors.query().where('tenant_id', tenantid);

    if (!tenantVisitors || tenantVisitors.length === 0) {
      return res.status(404).json({ error: 'No visitors found for this tenant.' });
    }

    res.status(200).json(tenantVisitors);
  } catch (error) {
    console.error("Error fetching visitors by tenant ID:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

//Get visitor by Id

const getVisitorById = async (req, res) => {
  const {visitorid } = req.params;

  try {
    const visitor = await visitors.query().findById(visitorid);

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
    console.error(error);
    return res.status(500).send({
      message: "Internal server error"
    });
  }
}
// Update Visitor details
const updateVisitorDetails = async (req, res) => {
  const { visitorId } = req.params;
  const editables = [
    "first_name","last_name", "phone_number", "vehicle_details", "tenant_id",
    "expected_date", "remarks", "type_id", "national_id", "expected_time"
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
const deleteVisitorsById = async (req, res) => {
  const { visitorid } = req.params;

  try {
    //check if visitor exists
    const visitorExists = await visitors.query().findById(visitorid);
    if (!visitorExists) {
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
  getVisitorsByTenantId,
  getVisitorById,
  deleteVisitorsById,
  updateVisitorDetails,

}

