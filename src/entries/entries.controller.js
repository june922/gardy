const Users = require('../users/users.model'); // Import the Users model
const entries = require('./entries.model');
const Entries = require('./entries.model'); // Import the Entries model

const createEntry = async (req, res) => {
  try {
    const {
      number_plate,
      vehicle_color,
      vehicle_make,
      national_id,
      driver_name,
      house_id,
      purpose,
      remarks,
      security_guard_id,
      check_in,
    } = req.body;

    let user = null;

    // Check if it's a vehicle (by checking for number_plate)
    if (number_plate) {
      // Log the vehicle entry with the vehicle details
      const newEntry = await Entries.query().insert({
        house_id,
        security_guard_id,
        check_in,
        number_plate,
        vehicle_color,
        vehicle_make,
        cargo: purpose, // Purpose logged as cargo
        remarks: remarks || `Driver: ${driver_name || 'Unknown'} (${national_id || 'N/A'})`,
        driver_details: {
          name: driver_name,
          national_id: national_id || 'N/A',
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Vehicle entry created successfully.',
        data: newEntry,
      });
    }

    // Check if it's a pedestrian (based on house_id or national_id)
    if (house_id || national_id) {
      // Find the user based on house_id or national_id
      user = await Users.query().findOne({
        ...(house_id && { house_id }), // If house_id is provided
        ...(national_id && { national_id }), // If national_id is provided
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: `Pedestrian not found. Please check the house ID or national ID.`,
        });
      }

      // Log the pedestrian entry
      const newEntry = await Entries.query().insert({
        user_id: user.id,
        house_id,
        security_guard_id,
        check_in,
        cargo: purpose, // Purpose logged as cargo
        remarks: remarks || 'No cargo',
      });

      return res.status(201).json({
        success: true,
        message: 'Pedestrian entry created successfully.',
        data: newEntry,
      });
    }

    // If neither vehicle nor pedestrian details are provided
    return res.status(400).json({
      success: false,
      message: 'Either vehicle details or pedestrian details (house_id/national_id) are required.',
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
// Get entry by ID
const getEntryById = async (req, res) => {
  const { entryId } = req.params;

  try {
    // Find entry by ID
    const entry = await entries.query().findById(entryId);

    if (!entry) {
      // If no entry found, return 404
      return res.status(404).json({
        success: false,
        message: `Entry with ID ${entryId} not found.`,
      });
    }

    // Return the found entry
    res.status(200).json({
      success: true,
      data: entry,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the entry.',
      error: err.message,
    });
  }
};

//Get by user Id
const getEntryByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
      const userEntry = await entries.query().where({ user_id: userId }); // Adjust the query to match your database structure

      if (!userEntry || userEntry.length === 0) {
          console.log(error)
          return res.status(404).json({ error: 'No Enrteis found for this user' });
      }
      
      // Remove unnecessary keys
      const keysToRemove = ['created_at', 'updated_at'];
      const filteredUserEntry = userEntry.map(entries => {
          return Object.keys(entries).reduce((acc, key) => {
              if (!keysToRemove.includes(key)) {
                  acc[key] = entries[key];
              }
              return acc;
          }, {});
      });

      res.status(200).json(filteredUserEntry)
  } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Internal server error" });
  }
};





module.exports = {
  createEntry,
  getEntryById,
  getEntryByUserId,
};
