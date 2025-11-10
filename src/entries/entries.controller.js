const users = require('../users/users.model'); // Import the Users model
const entries = require('./entries.model'); // Import the entries model
const entrytypes = require('../entrytype/entrytypes.model'); // Import the entry types model
const employees = require('../employees/employees.model'); // Import the employees model
const tenants = require('../tenants/tenants.model'); // Import the tenants model
const visitortypes = require('../visitortypes/visitortypes.model'); // Import the visitor types model
const visitors = require('../visitors/visitors.model'); // Import the visitors model
const vehicles = require('../Vehicles/vehicles.model'); // Import the vehicles model

const { validateVehicleDetails } = require('../utils/vehiclehelper'); // Import the vehicle validation utility

const createEntry = async (req, res) => {
  try {
    const {
      entry_type_id,
      visitor_type_id,
      first_name,
      last_name,
      national_id,
      phone_number,
      vehicle_id,
      checked_in_by,
      check_in,
      check_out,
      checked_out_by,
      remarks,
      house_id,
      tenant_id,
      vehicle_details
    } = req.body;

    console.log('📥 Received check-in data:', {
      entry_type_id,
      tenant_id,
      first_name,
      phone_number,
      house_id
    });

    // ✅ Check if already checked in
    const existingOpenEntry = await entries.query()
      .where('phone_number', phone_number)
      .whereNull('check_out')
      .first();

    if (existingOpenEntry) {
      return res.status(400).json({
        error: 'This person is already checked in. Please check out first.'
      });
    }

    // ✅ Define required fields based on entry type
    let requiredFields = ['first_name', 'last_name', 'phone_number', 'entry_type_id', 'check_in', 'checked_in_by', 'house_id'];

    if (entry_type_id === 1) {
      // Tenant check-in requires tenant_id
      requiredFields.push('tenant_id');
    } else if (entry_type_id === 2) {
      // Visitor check-in requires national_id and visitor_type_id
      requiredFields.push('national_id', 'visitor_type_id');
    }

    // ✅ Check for missing fields
    const missingFields = requiredFields.filter(field => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      return res.status(400).send({
        message: 'Missing required fields',
        missingFields
      });
    }

    // ✅ Check entry type exists
    const entryType = await entrytypes.query().findById(entry_type_id);
    if (!entryType) {
      return res.status(400).json({
        success: false,
        message: 'Invalid entry type.',
      });
    }

    // ✅ Check if guard exists
    const guardExists = await employees.query().where({ id: checked_in_by }).first();
    if (!guardExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid guard ID.',
      });
    }

    // ✅ Handle TENANT
    if (entry_type_id === 1) {
      console.log('🔍 Checking tenant:', tenant_id);

      // Check if tenant exists
      const tenant = await tenants.query().findById(tenant_id);
      if (!tenant) {
        return res.status(404).json({ 
          success: false,
          error: 'Tenant not found' 
        });
      }
    }

    // ✅ Handle VISITOR
    if (entry_type_id === 2) {
      console.log('🔍 Checking visitor type:', visitor_type_id);

      // Check if visitor type exists
      const visitorType = await visitortypes.query().findById(visitor_type_id);
      if (!visitorType) {
        return res.status(400).json({
          success: false,
          message: 'Invalid visitor_type_id.',
        });
      }

      // ✅ Visitor type 2 (transport) requires valid vehicle details
      if (visitor_type_id === 2) {
        if (!vehicle_details) {
          return res.status(400).json({
            success: false,
            message: 'Transport visitors must provide vehicle details.',
          });
        }
        
        // Validate vehicle details if provided
        if (vehicle_details && !validateVehicleDetails(vehicle_details)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid vehicle details provided.',
          });
        }
      } else {
        // For other visitor types, validate vehicle details only if provided
        if (vehicle_details && !validateVehicleDetails(vehicle_details)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid vehicle details provided.',
          });
        }
      }
    }

    // ✅ FIXED: Prepare entry data STRICTLY following schema
    const entryData = {
      entry_type_id,
      first_name: first_name || null,
      last_name: last_name || null,
      national_id: national_id || null,
      phone_number: phone_number || null,
      visitor_type_id: visitor_type_id || null,
      checked_in_by,
      check_in,
      check_out: check_out || null,
      checked_out_by: checked_out_by || null,
      remarks: remarks || null, // ✅ Ensure remarks is string (not object)
      house_id,
      tenant_id: tenant_id || null,
      // ❌ REMOVED: user_id, estate_id - not in schema
    };

    // ✅ FIXED: Only add vehicle_details if provided and valid
    if (vehicle_details && Object.keys(vehicle_details).length > 0) {
      // Ensure vehicle_details follows the exact schema structure
      const validVehicleDetails = {};
      if (vehicle_details.description) validVehicleDetails.description = vehicle_details.description.toString();
      if (vehicle_details.make) validVehicleDetails.make = vehicle_details.make.toString();
      if (vehicle_details.model) validVehicleDetails.model = vehicle_details.model.toString();
      if (vehicle_details.color) validVehicleDetails.color = vehicle_details.color.toString();
      if (vehicle_details.number_plate) validVehicleDetails.number_plate = vehicle_details.number_plate.toString();
      
      if (Object.keys(validVehicleDetails).length > 0) {
        entryData.vehicle_details = validVehicleDetails;
      }
    }

    console.log('💾 Creating entry with schema-compliant data:', entryData);

    const newEntry = await entries.query().insert(entryData);

    return res.status(201).json({
      success: true,
      message: 'Welcome to the estate.',
      data: { ...newEntry }
    });

  } catch (error) {
    console.error('❌ Check-in error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during check-in.',
      error: error.message
    });
  }
};



// Get Entry by ID
const getEntryById = async (req, res) => {
  const { entry_Id } = req.params;

  try {
    const entry = await entries.query().findById(entry_Id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error('Error fetching entry by ID:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the entry.',
      error: error.message,
    });
  }
};

// Get Entries by House ID
const getEntryByHouseId = async (req, res) => {
  const { houseId } = req.params;

  try {
    const userEntry = await entries.query().where({ house_id: houseId });

    if (!userEntry || userEntry.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No entries found for this house ID.',
      });
    }

    const keysToRemove = ['created_at', 'updated_at'];
    const filteredEntries = userEntry.map((entry) => {
      return Object.keys(entry).reduce((acc, key) => {
        if (!keysToRemove.includes(key)) {
          acc[key] = entry[key];
        }
        return acc;
      }, {});
    });

    res.status(200).json({
      success: true,
      data: filteredEntries,
    });
  } catch (error) {
    console.error('Error fetching entries by house ID:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the entries.',
      error: error.message,
    });
  }
};

//get all 
const getAllEntries = async (req, res) => {

  try {
    const allEntries = await entries.query();

    res.status(200).json(allEntries);

  } catch (error) {
    return res.status(500).send({
      message: "internal server error."
    });
  }
}


//Check out
const updateEntryCheckOut = async (req, res) => {
  try {
    const { check_out, checked_out_by, remarks } = req.body;
    const { entry_id } = req.params; // Get entry_id from request parameters

    // Validate input
    if (!entry_id) {
      return res.status(400).json({
        success: false,
        message: 'Entry ID is required in the URL parameter.',
      });
    }

    if (!check_out || !checked_out_by) {
      return res.status(400).json({
        success: false,
        message: 'Check-out time and security guard ID are required in the body.',
      });
    }

    // Find the entry by ID
    const existingEntry = await entries.query().findById(entry_id);

    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found. Please provide a valid entry ID.',
      });
    }

    // Check if the entry already has a check-out time
    if (existingEntry.check_out) {
      return res.status(400).json({
        success: false,
        message: 'This entry has already been checked out.',
      });
    }

    // Update the check-out time in the entries table
    const updatedEntry = await entries.query().patchAndFetchById(entry_id, {
      check_out,
      checked_out_by,
    });

    return res.status(200).json({
      success: true,
      message: 'Check-out updated successfully.',
      data: updatedEntry,
    });
  } catch (error) {
    console.error('Error updating check-out:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating check-out.',
      error: error.message,
    });
  }
}
// const updateCheckInDetails = async (req, res) => {
//   try {
//     const { check_in, first_name, national_id, number_plate, house_id, phone_number, remarks } = req.body;
//     const { entry_id } = req.params; // Get entry_id from the URL parameter

//     // Validate input
//     if (!entry_id) {
//       return res.status(400).json({
//         success: false,
//         message: 'Entry ID is required in the URL parameter.',
//       });
//     }

//     if (!check_in) {
//       return res.status(400).json({
//         success: false,
//         message: 'Check-in time is required in the body.',
//       });
//     }

//     // Find the entry by ID
//     const existingEntry = await entries.query().findById(entry_id);

//     if (!existingEntry) {
//       return res.status(404).json({
//         success: false,
//         message: 'Entry not found. Please provide a valid entry ID.',
//       });
//     }

//     // Check if the entry has already been checked out
//     if (existingEntry.check_out) {
//       return res.status(400).json({
//         success: false,
//         message: 'Cannot update check-in details after check-out has been recorded.',
//       });
//     }
//     // Update the check-in details
//     const updatedEntry = await entries.query().patchAndFetchById(entry_id, {
//       check_in,
//       first_name: first_name || existingEntry.first_name, // Keep the current first_name, if not provided
//       national_id: national_id || existingEntry.national_id,
//       number_plate: number_plate || existingEntry.number_plate,
//       house_id: house_id || existingEntry.house_id,
//       phone_number: phone_number || existingEntry.phone_number,
//       remarks: remarks || existingEntry.remarks,
//     });

//     return res.status(200).json({
//       success: true,
//       message: 'Check-in details updated successfully.',
//       data: updatedEntry,
//     });

//   } catch (error) {
//     console.error('Error updating check-in details:', error);
//     res.status(500).json({
//       success: false,
//       message: 'An error occurred while updating check-in details.',
//       error: error.message,
//     });
//   };
// }



module.exports = {
  createEntry,
  getEntryById,
  getEntryByHouseId,
  updateEntryCheckOut,

  getAllEntries,
};

//check if visitor exists