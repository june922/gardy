const estates = require('../../estates/estates.model');
const employees = require('../../employees/employees.model');
const tenants = require('../../tenants/tenants.model');
const houses = require('../../houses/houses.model');
const cities = require('../../city/city.model'); // Import cities model for town_name

async function getEstateManagementAnalytics(req, res) {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required.' });
    }

    try {
        // 1. Get all estates for the given userId, eager-loading town information
        const userEstates = await estates.query().where('created_by', userId).withGraphFetched('town');
        const estateIds = userEstates.map(estate => estate.id);

        if (userEstates.length === 0) {
            return res.status(200).json({
                message: 'No estates found for this user.',
                statistics: {
                    numberOfEstates: 0,
                    numberOfEmployees: 0,
                    numberOfTenants: 0,
                    numberOfHouses: 0,
                    estates: [], // Renamed from housesPerEstate
                }
            });
        }

        // 2. Number of estates
        const numberOfEstates = userEstates.length;

        // 3. Fetch all employees for user's estates and group by estate_id
        const allEmployees = await employees.query().whereIn('estate_id', estateIds);
        const employeesByEstate = allEmployees.reduce((acc, employee) => {
            acc[employee.estate_id] = (acc[employee.estate_id] || 0) + 1;
            return acc;
        }, {});

        // 4. Get all houses in those estates
        const allHouses = await houses.query().whereIn('estate_id', estateIds);
        const numberOfHouses = allHouses.length;
        const allHouseIds = allHouses.map(house => house.id);

        // 5. Fetch all active tenants for houses in user's estates and group by estate_id
        const activeTenants = allHouseIds.length > 0 ? await tenants.query().where('status_id', 2).whereIn('house_id', allHouseIds) : [];
        
        // Map active tenants to their house_ids for quick lookup
        const activeTenantHouseIds = new Set(activeTenants.map(tenant => tenant.house_id));

        // Group active tenants by the estate_id of their house
        const tenantsByEstate = activeTenants.reduce((acc, tenant) => {
            const house = allHouses.find(h => h.id === tenant.house_id); // Find the house corresponding to the tenant
            if (house) {
                acc[house.estate_id] = (acc[house.estate_id] || 0) + 1;
            }
            return acc;
        }, {});

        // 6. Assemble enhanced estates data
        const estatesWithDetails = userEstates.map(estate => {
            const estateHouses = allHouses.filter(house => house.estate_id === estate.id);
            let occupied_houses = 0;
            let vacant_houses = 0;

            for (const house of estateHouses) {
                if (activeTenantHouseIds.has(house.id)) {
                    occupied_houses++;
                } else {
                    vacant_houses++;
                }
            }

            return {
                estate_id: estate.id,
                estate_name: estate.name,
                address: estate.address,
                town_name: estate.town ? estate.town.name : 'N/A', // Use N/A if town is not available
                employee_count: employeesByEstate[estate.id] || 0,
                tenant_count: tenantsByEstate[estate.id] || 0,
                total_house_count: estateHouses.length,
                occupied_houses,
                vacant_houses,
            };
        });

        // 7. Assemble final response statistics
        const statistics = {
            numberOfEstates,
            numberOfEmployees: allEmployees.length, // Total employees across all estates
            numberOfTenants: activeTenants.length, // Total active tenants across all estates
            numberOfHouses: allHouses.length, // Total houses across all estates
            estates: estatesWithDetails, // Renamed and enhanced
        };

        res.status(200).json({ statistics });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while fetching estate management analytics.', error: error.message });
    }
}

module.exports = {
    getEstateManagementAnalytics,
};