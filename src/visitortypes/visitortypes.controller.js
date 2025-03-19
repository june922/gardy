const visitortypes = require('./visitortypes.model');

// Get all visitor types
const getAllVisitorTypes = async (req, res) => {
  try {
    const allVisitorTypes = await visitortypes.query();
    res.status(200).json(allVisitorTypes);
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).send({
      message: "Internal server error.",
    });
  }
};

module.exports = {
  getAllVisitorTypes,
};
