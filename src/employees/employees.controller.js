const users = require('../users/users.model');
const employees = require('./employees.model');
const statuses = require('../statuses/statuses.model');
const estates = require('../estates/estates.model');

const addEmployees = async (req, res) => {
  const { employee_number, created_by, status_id, user_id, estate_id,created_at } = req.body;

  try {
    console.log('Received request body:', req.body);

    // Check if employee has a user account 
    const userAcc = await users.query().findById(user_id);
    if (!userAcc) {
      console.log(`User account with ID ${user_id} not found.`);
      return res.status(400).json({ message: "User account not found." });
    }
    console.log('✅ User account exists:', userAcc);

    // Check for missing attributes
    const requiredAttributes = ['user_id', 'status_id', 'created_by', 'estate_id'];
    const missingAttributes = requiredAttributes.filter(attr => !req.body[attr]);

    if (missingAttributes.length > 0) {
      console.log('❌ Missing required attributes:', missingAttributes);
      return res.status(400).json({
        "Missing attributes": missingAttributes.join(', ')
      });
    }

    // Check if employee already exists
    const employeeExists = await employees.query()
      .where('user_id', user_id)
      .first();

    if (employeeExists) {
      console.log('❌ Employee already exists:', employeeExists);
      return res.status(400).json({ message: "Employee already exists." });
    }
    console.log('✅ No duplicate employee found.');

    // Check if estate exists
    const estateExists = await estates.query().findById(estate_id);
    if (!estateExists) {
      console.log(`❌ Estate with ID ${estate_id} not found.`);
      return res.status(400).json({ message: "Estate does not exist." });
    }
    console.log('✅ Estate exists:', estateExists);

    // Insert the new employee
    const newEmployee = await employees.query().insert({
      user_id,
      estate_id,
      employee_number,
      created_by,
      status_id,
      created_at
    });

    console.log('✅ New employee created:', newEmployee);
    res.status(201).json(newEmployee);

  } catch (error) {
    console.error('🔥 Error creating employee:', error);
    res.status(500).json({ message: "Internal server error." });
  }
};


//update

 const updateEmployeeDetails = async (req, res) => {
  const { employeeid } = req.params;
  const editables = [ "status_id", "employee_number", "estate_id",];

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

  try {
    const employeeExists = await employees.query().where({ id:employeeid }).first();
    if (!employeeExists) {
      return res.status(404).json({ message: "Failed! Does not exist!" });
    }

    await employees.query().patch(updates).where({ id:employeeid });
    res.status(200).json({ message: "Updated successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  
};

  }

  // Get by id
  const getById = async (req, res) => {
    const { employeeid } = req.params;

    try {
      const employee = await employees.query().findById(employeeid);

      if (!employee) {
        return res.status(404).json({ error: 'Not found' });
      }

      const keysToRemove = [ 'created_at', 'updated_at'];
      const filteredEmployee = Object.keys(employee).reduce((acc, key) => {
        if (!keysToRemove.includes(key)) {
          acc[key] = employee[key];
        }
        return acc;
      }, {});

      res.status(200).json(filteredEmployee);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  };

  // Get all employees
  const getAllEmployees = async (req, res) => {
    try {
      const allEmployees = await employees.query();
      res.status(200).json(allEmployees);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  };
//get by estate id
const getByEstateId = async (req, res) => {
  const { estateid } = req.params;

  try {
    const employeesByEstate = await employees.query().where('estate_id', estateid);

    if (!employeesByEstate || employeesByEstate.length === 0) {
      return res.status(404).json({ error: 'No employees found for this estate' });
    }

    const keysToRemove = ['created_at', 'updated_at'];
    const filteredEmployees = employeesByEstate.map(employee => {
      return Object.keys(employee).reduce((acc, key) => {
        if (!keysToRemove.includes(key)) {
          acc[key] = employee[key];
        }
        return acc;
      }, {});
    });

    return res.status(200).json(filteredEmployees);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error" });
  }
};

//Delete employees
  const deleteEmployeesById = async (req, res) => {
    const { id } = req.params;

    try {
      // Check if employee exists
      const employee = await employees.query().findById(id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      // Check if employee status is inactive (status_id = 3)
      if (employee.status_id !== 3) {
        return res.status(400).json({ message: "Only inactive employees can be deleted" });
      }

      // Delete employee
      await employees.query().deleteById(id);
      res.status(200).json({ message: "Deleted successfully" });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  
  
  
  module.exports = {
    addEmployees,
   updateEmployeeDetails,
    getById,
    getAllEmployees,
    deleteEmployeesById,
    getByEstateId,

  };
