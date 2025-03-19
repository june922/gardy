const Users = require('../users/users.model'); // Import the Users model
const entries = require('./entries.model'); // Import the entries model
const vehicles = require('../Vehicle/vehicles.model');


// Create Entry
const createEntry = async (req, res) => {
  try {
    const {
      entry_type_id,
      name,
      national_id,
      number_plate,
      phone_number,
      vehicle_color,
      vehicle_make,
      remarks,
      house_id,
      security_guard_id,
      check_in,
      
    } = req.body;
    
       // Check for vehicle in the vehicles table
       let vehicles = null;
       if (number_plate) {
         vehicles = await entries.query().select('*').from('vehicles').where({ number_plate }).first();
       }
   
       if (vehicles) {
         // Populate vehicle details from the `vehicles` table
         req.body.vehicle_color = vehicles.vehicle_color;
         req.body.vehicle_make = vehicles.vehicle_make;
         req.body.house_id = vehicles.house_id; // Associate with tenant's house
       }

    // Fetch allowed entry types dynamically from the database
    const allowedEntryTypes = await entries.query().select('id', 'name').from('entrytype');
    const allowedEntryTypeIds = allowedEntryTypes.map((type) => String(type.id));

    if (!allowedEntryTypeIds.includes(String(entry_type_id))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid entry type. Please provide a valid entry type.',
      });
    }

    // Process based on entry type
    switch (String(entry_type_id)) {
      case '1': // Pedestrian
        if (!name || !national_id || !check_in ||!house_id || !security_guard_id || !phone_number) {
          return res.status(400).json({
            success: false,
            message: 'Pedestrian entry requires name, national ID, check-in, check-out, house ID, and phone number.',
          });
        }
        break;

      case '2': // School Bus
        if (!name || !number_plate || !check_in || !security_guard_id) {
          return res.status(400).json({
            success: false,
            message: 'School bus entry requires name, number plate, check-in, check-out, and security guard ID.',
          });
        }
        break;

      case '3': // Taxi
        if (!name || !national_id || !check_in ||!house_id || !security_guard_id || !phone_number) {
          return res.status(400).json({
            success: false,
            message: 'Taxi entry requires name, national ID, check-in, check-out, house ID, and phone number.',
          });
        }
        break;

      case '4': // Vehicle
        if (!number_plate || !vehicle_color || !vehicle_make || !check_in || !phone_number || !house_id || !security_guard_id) {
          return res.status(400).json({
            success: false,
            message: 'Vehicle entry requires number plate, vehicle color, vehicle make, house ID, phone number, and security guard ID.',
          });
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid entry type. Please provide the correct entry type.',
        });
    }

    // Insert the entry into the database
    const newEntry = await entries.query().insert({
      entry_type_id,
      name,
      national_id,
      number_plate,
      phone_number,
      vehicle_color,
      vehicle_make,
      remarks: remarks || 'No remarks',
      house_id,
      security_guard_id,
      check_in,
      
    });

    const entryTypeName = allowedEntryTypes.find((type) => type.id === parseInt(entry_type_id))?.name || 'Entry';

    return res.status(201).json({
      success: true,
      message: `${entryTypeName} created successfully.`,
      data: newEntry,
    });
  } catch (error) {
    console.error('Error creating entry:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating the entry.',
      error: error.message,
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
}
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
        const { check_out, security_guard_id } = req.body;
        const { entry_id } = req.params; // Get entry_id from request parameters
    
        // Validate input
        if (!entry_id) {
          return res.status(400).json({
            success: false,
            message: 'Entry ID is required in the URL parameter.',
          });
        }
    
        if (!check_out || !security_guard_id) {
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
          security_guard_id,
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
    };
    const updateCheckInDetails = async (req, res) => {
      try {
        const { check_in, name, national_id, number_plate, house_id, phone_number, remarks } = req.body;
        const { entry_id } = req.params; // Get entry_id from the URL parameter
    
        // Validate input
        if (!entry_id) {
          return res.status(400).json({
            success: false,
            message: 'Entry ID is required in the URL parameter.',
          });
        }
    
        if (!check_in) {
          return res.status(400).json({
            success: false,
            message: 'Check-in time is required in the body.',
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
    
        // Check if the entry has already been checked out
        if (existingEntry.check_out) {
          return res.status(400).json({
            success: false,
            message: 'Cannot update check-in details after check-out has been recorded.',
          });
        };
     // Update the check-in details
    const updatedEntry = await entries.query().patchAndFetchById(entry_id, {
          check_in,
          name: name || existingEntry.name, // Keep the current name if not provided
          national_id: national_id || existingEntry.national_id,
          number_plate: number_plate || existingEntry.number_plate,
          house_id: house_id || existingEntry.house_id,
          phone_number: phone_number || existingEntry.phone_number,
          remarks: remarks || existingEntry.remarks,
        });
    
        return res.status(200).json({
          success: true,
          message: 'Check-in details updated successfully.',
          data: updatedEntry,
        });
      } catch (error) {
        console.error('Error updating check-in details:', error);
        res.status(500).json({
          success: false,
          message: 'An error occurred while updating check-in details.',
          error: error.message,
        });
      }
    };
    
  

module.exports = {
  createEntry,
  getEntryById,
  getEntryByHouseId,
  updateEntryCheckOut,
  updateCheckInDetails,
  getAllEntries,
};
