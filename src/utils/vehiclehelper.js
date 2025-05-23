// utils/vehicleHelpers.js

function validateVehicleDetails(vehicle) {
    if (!vehicle) return false;
  
    const { number_plate } = vehicle;
    return typeof number_plate === 'string' && number_plate.trim() !== '';
  }
  
  module.exports = {
    validateVehicleDetails
  };
  