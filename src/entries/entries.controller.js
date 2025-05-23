const users = require('../users/users.model'); // Import the Users model
const entries = require('./entries.model'); // Import the entries model
const entrytypes = require('../entrytype/entrytypes.model'); // Import the entry types model
const employees = require('../employees/employees.model'); // Import the employees model
const tenants = require('../tenants/tenants.model'); // Import the tenants model
const visitortypes = require('../visitortypes/visitortypes.model'); // Import the visitor types model
const visitors = require('../visitors/visitors.model'); // Import the visitors model
const vehicles = require('../Vehicles/vehicles.model'); // Import the vehicles model
const timehelper = require('../utils/timehelper'); // Import the time helper utility
const { validateVehicleDetails } = require('../utils/vehiclehelper'); // Import the vehicle validation utility

const createEntry = async (req, res) => {

  try {

    
    const requiredFields = ['first_name','last_name', 'phone_number', 'entry_type_id', 'check_in', 'checked_in_by', 'house_id'];
    const  {
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
      user_id,
     
      tenant_id,
     
      vehicle_details

    } = req.body;

    // Check if already checked in
    const existingOpenEntry = await entries.query()
      .where('phone_number', phone_number)
      .whereNull('check_out')
      .first();

    if (existingOpenEntry) {
      return res.status(400).json({
        error: 'This person is already checked in. Please check out first.'
      });
    }
    
    const missingFields = requiredFields.filter(field => !(field in req.body));
    if (missingFields.length) {
        return res.status(400).send({
            message: 'Missing required fields',
            missingFields
        });

    // Convert times to UTC (optional depending on DB preference)
    // const checkInLocal = timehelper.toLocal(check_in);
    // const checkOutLocal = check_out ? timehelper.toLocal(check_out) : null;
      }

    // Step 1: Check entry type exists
    const entryType = await entrytypes.query().findById(entry_type_id);
    if (!entryType) {
      return res.status(400).json({
        success: false,
        message: 'Invalid entry type.',
      });
    }


    // Check if guard exists
    const guardExists = await employees.query().where({ id: checked_in_by }).first();
    if (!guardExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid guard ID.',
      });
    }
    


    // Step 2: Handle TENANT
    if (entry_type_id === 1) {
      if (!user_id || !check_in || !checked_in_by) {
        return res.status(400).json({
          success: false,
          message: 'user_id, check_in, and checked_in_by are required for tenant check-in.',
        });
      }

      // Check if tenant exists
      const tenant = await tenants.query().findById({ id: tenant_id }).first();

      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      let vehicleDetails = null;
      if (vehicle_id) {
        const vehicle = await vehicles.query()
          .where({ id: vehicle_id, user_id })
          .select(['make', 'model', 'color', 'number_plate'])
          .first();

        if (!vehicle) {
          return res.status(404).json({ error: 'Vehicle not found for this tenant' });
        }

        vehicleDetails = {
          make: vehicle.make,
          model: vehicle.model,
          color: vehicle.color,
          number_plate: vehicle.number_plate
        };
      }

 
    }

    // Step 3: Handle VISITOR

    if (entry_type_id === 2) {
      if (!entry_type_id) {
        return res.status(400).json({
          success: false,
          message: 'Visitor type is required for visitor check-in.',
        });
      
      }
      //check if visitor type exists
      const visitorType = await visitortypes.query().findById(visitor_type_id);
      if (!visitorType) {
        return res.status(400).json({
          success: false,
          message: 'visitor_type_id is required for visitor check-in.',
        });
      }
   //guest details
   
    if (!national_id ) {
      return res.status(400).json({
        success: false,
        message: 'national_id.',
      });
    }

    
     

      // Visitor type 2 (transport) requires valid vehicle details must provide national id
      if (visitor_type_id === 2 && !vehicle_details) {
        return res.status(400).json({
          success: false,
          message: 'Transport visitors must provide complete vehicle details (make, model, color, plate).',
        });
      }
      //validate vehicle details
      if ( vehicle_details && !validateVehicleDetails(vehicle_details)) {
        return res.status(400).json({
          success: false,
          message: 'If personnel provides vehicle info, all fields (make, model, color, plate) must be filled.',
        });
      }


    }

    const newEntry = await entries.query().insert({
      entry_type_id,
      first_name: first_name || null,
      last_name: last_name || null,
      national_id: national_id || null,
      phone_number: phone_number || null,
      vehicle_details: vehicle_details || null,
      visitor_type_id,
      checked_in_by,
      check_in,
      check_out: check_out || null,
      remarks: remarks || null,
      house_id,
    });
      
        return res.status(201).json({
          success: true,
          message: 'Welcome to the estate.',
          data: newEntry
        });
      
  } catch (error) {
    console.error('Check-in error:', error);
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