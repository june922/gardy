// utils/vehicleHelpers.js
/**
 * Validates vehicle details
 * Accepts TWO formats:
 * 1. New format: { description: "BMW RED KDQ15" } ✅
 * 2. Old format: { make, model, color, number_plate } - all fields required if any provided ✅
 * 
 * @param {Object} vehicleDetails - The vehicle details object
 * @returns {boolean} - True if valid, false otherwise
 */
const validateVehicleDetails = (vehicleDetails) => {
  if (!vehicleDetails || typeof vehicleDetails !== 'object') {
    return false;
  }

  // ✅ NEW FORMAT: Check if description exists
  if ('description' in vehicleDetails) {
    // Description format is valid if description is a non-empty string
    return typeof vehicleDetails.description === 'string' && vehicleDetails.description.trim().length > 0;
  }

  // ✅ OLD FORMAT: Check if any of the structured fields exist
  const { make, model, color, number_plate } = vehicleDetails;
  
  // If ANY structured field is provided, ALL must be provided
  if (make || model || color || number_plate) {
    return !!(
      make && make.trim() &&
      model && model.trim() &&
      color && color.trim() &&
      number_plate && number_plate.trim()
    );
  }

  // If neither format is provided, it's invalid
  return false;
};

module.exports = {
  validateVehicleDetails,
};