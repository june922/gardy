
const tenants = require('../tenants/tenants.model');
const houses = require('../houses/houses.model');
const statuses = require('../statuses/statuses.model');
const estates = require('../estates/estates.model');


// Create tenant

const createTenants = async (req, res) => {

  const {  user_email,house_id,user_id,created_by,num_occupants,tenancy_start_date,tenancy_end_date,emergency_contact,status_id,pet_info,created_at } = req.body;

  try {
    // Fetch  to check if house exists
    const houseExists = await houses.query().findById(house_id);

    if (!houseExists) {
      return res.status(400).json({
        message: "House does not exist."
      });

    }

    // Define required attributes for all users
    let requiredAttributes = [ 'user_email', 'house_id', 'created_by'];

    // Check for missing attributes
    const missingAttributes = requiredAttributes.filter(attr => !req.body[attr]);

    if (missingAttributes.length > 0) {
      return res.status(400).json({
        "Missing attributes": missingAttributes.join(', ')
      });
    }
    const tenantExists = await tenants.query()
      .where('user_email', user_email)
      .orWhere('house_id', house_id)
      .first();

    if (tenantExists) {
      return res.status(400).send({
        message: "Failed.Tenant exists! "
      });
    }

    // Insert the new tenant into the database
    const newTenant = await tenants.query().insert({
      house_id,
      num_occupants,
      tenancy_start_date,
      tenancy_end_date,
      pet_info,
      user_id,
      status_id,
      user_email,
      emergency_contact,
      created_by,
      created_at

    });
      
      // Return the created user details
      res.status(201).json({
        message: "Tenant Created Successfully.",
        data: { ...newTenant }
      });
    }
     catch (error) {
      console.error(error);
      res.status(500).send('Error creating tenant: ' + error.message);
    }
  };


  // Update tenant details
  const updateTenantDetails = async (req, res) => {
    const { tenantid } = req.params;
    const editables = ["user_id", "status_id", "tenancy_start_date", "tenancy_end_date", "pet_info", "emergency_contact","num_occupants", "user_email", "house_id","created_by", "created_at"];

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

    if (req.body.user_email) {
      const userEmailExists = await tenants.query().where({ user_email: req.body.user_email }).first();
      if (userEmailExists) {
        return res.status(400).json({ message: "Failed! UserEmail already taken!" });
      }
    }

    try {
      const tenantExists = await tenants.query().where({ id:tenantid }).first();
      if (!tenantExists) {
        return res.status(404).json({ message: "Failed! Does not exist!" });
      }

      await tenants.query().patch(updates).where({ id:tenantid });
      res.status(200).json({ message: "Updated successfully!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    
  };

    }

  // Get tenants by ID
  const getTenantDetailsById = async (req, res) => {
    const { tenantid } = req.params;

    try {
      const tenant = await tenants.query().findById(tenantid);

      if (!tenant) {
        return res.status(404).json({ error: 'Not found' });
      }

      const keysToRemove = [ 'created_at', 'updated_at'];
      const filteredTenant = Object.keys(tenant).reduce((acc, key) => {
        if (!keysToRemove.includes(key)) {
          acc[key] = tenant[key];
        }
        return acc;
      }, {});

      res.status(200).json(filteredTenant);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  };

  // Get all tenants
  const getAllTenants = async (req, res) => {
    try {
      const allTenants = await tenants.query();
      res.status(200).json(allTenants);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  };


//Delete tenants
  const deleteTenantsById = async (req, res) => {
    const { id } = req.params;
  
    try {
      // Check if tenant exists
      const tenant = await tenants.query().findById(id);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
  
      // Check if tenant status is inactive (status_id = 3)
      if (tenant.status_id !== 3) {
        return res.status(400).json({ message: "Only inactive tenants can be deleted" });
      }
  
      // Delete tenant
      await tenants.query().deleteById(id);
      res.status(200).json({ message: "Deleted successfully" });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
  
  
  module.exports = {
    createTenants,
    updateTenantDetails,
    getTenantDetailsById,
    getAllTenants,
   
    deleteTenantsById,
  };
