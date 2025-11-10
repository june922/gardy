// controllers/secondaryTenantsController.js - WITH ALL IMPORTS
const tenants = require('../tenants/tenants.model');
const users = require('../users/users.model');
const houses = require('../houses/houses.model');
const useruserroles = require('../useruserroles/useruserroles.model');
const userroles = require('../userroles/userroles.model');
const userusertypes = require('../userusertypes/userusertypes.model'); // ✅ ADD THIS
const usertypes = require('../usertypes/usertypes.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper function to generate random password
const generateRandomPassword = () => {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// controllers/secondaryTenantsController.js - RETURN PASSWORD
const createSecondaryTenant = async (req, res) => {
  try {
    // User is already authenticated by middleware
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    console.log('🔍 Checking permissions for user:', req.user);

    // Check if user can create secondary tenants
    const allowedRoles = [1, 3]; // Estate Admin and Primary Tenant
    
    if (!allowedRoles.includes(req.user.role_id)) {
      return res.status(403).json({
        message: 'Only primary tenants and estate admins can add family members. Your role: ' + req.user.role_name
      });
    }

    // Parse houseId to integer
    const houseId = parseInt(req.params.houseId);
    const {
      first_name,
      last_name,
      user_email,
      phone_number,
      relationship
    } = req.body;

    const created_by = req.user.userId;

    console.log('👨‍👩‍👧‍👦 Creating family member for house:', houseId, 'by user:', req.user.userId);
    console.log('📦 Request body:', req.body);

    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'user_email', 'phone_number', 'relationship'];
    const missingFields = requiredFields.filter(field => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });
    
    if (missingFields.length > 0) {
      console.log('❌ Missing fields:', missingFields);
      return res.status(400).json({
        message: 'Missing required fields',
        missingFields
      });
    }

    // Check if house exists
    const house = await houses.query().findById(houseId);
    if (!house) {
      return res.status(404).json({ message: 'House not found' });
    }

    console.log('✅ House found:', house.id);

    // For tenants (role_id 3), verify they own this house
    // For estate admins (role_id 1), skip this check
    if (req.user.role_id === 3) {
      const mainTenant = await tenants.query()
        .where('user_id', req.user.userId)
        .andWhere('house_id', houseId)
        .first();

      if (!mainTenant) {
        return res.status(403).json({
          message: 'You can only add family members to your own house'
        });
      }
    }

    // Check if email already exists in tenants
    const existingTenant = await tenants.query()
      .where('user_email', user_email)
      .first();

    if (existingTenant) {
      console.log('❌ Email already exists in tenants:', user_email);
      return res.status(400).json({
        message: 'A family member with this email already exists'
      });
    }

    // Check if user already exists
    let user = await users.query().where('user_email', user_email).first();
    
    if (user) {
      console.log('❌ User already exists:', user_email);
      return res.status(400).json({
        message: 'This email is already registered in the system'
      });
    }

    console.log('✅ Email is available, creating user...');

    // Create user account - ✅ STORE THE PASSWORD
    const temporaryPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    
    // Generate a unique numeric national_id
    const uniqueNationalId = parseInt(Date.now().toString().slice(-9));
    
    user = await users.query().insert({
      first_name: first_name,
      last_name: last_name,
      user_email: user_email,
      user_password: hashedPassword,
      phone_number: phone_number,
      national_id: uniqueNationalId,
    });
    
    const userId = user.id;
    console.log('✅ User account created:', userId);
    console.log('🔑 Temporary password:', temporaryPassword); // Log the password

    // Assign Secondary Tenant user type (type_id 24)
    await userusertypes.query().insert({
      user_id: userId,
      user_type_id: 24 // Secondary Tenant type from usertypes
    });

    console.log('✅ Assigned Secondary Tenant user type (24)');

    // Also assign a basic user role so they can login
    // Use Tenant role (role_id 3) for now
    await useruserroles.query().insert({
      user_id: userId,
      user_role_id: 3 // Tenant role for basic access
    });

    console.log('✅ Assigned Tenant user role (3) for login access');

    // Create tenant record
    const secondaryTenant = await tenants.query().insert({
      user_id: userId,
      user_email: user_email,
      house_id: houseId,
      emergency_contact: `${relationship} of ${req.user.first_name} ${req.user.last_name}`,
      status_id: 2, // Active
      created_by: created_by,
      num_occupants: 1,
      pet_info: JSON.stringify({
        is_secondary: true,
        main_tenant_id: req.user.userId,
        relationship: relationship,
        main_tenant_name: `${req.user.first_name} ${req.user.last_name}`,
        temporary_password: temporaryPassword // ✅ Store password in metadata
      })
    });

    console.log('✅ Secondary tenant created:', secondaryTenant.id);

    res.status(201).json({
      message: 'Family member added successfully!',
      data: {
        id: secondaryTenant.id,
        first_name: first_name,
        last_name: last_name,
        user_email: user_email,
        phone_number: phone_number,
        relationship: relationship,
        user_id: userId,
        tenant_id: secondaryTenant.id,
        temporary_password: temporaryPassword // ✅ RETURN THE PASSWORD
      }
    });

  } catch (error) {
    console.error('❌ Error creating family member:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
      stack: error.stack
    });
  }
};


const getSecondaryTenantsByHouse = async (req, res) => {
  try {
    const { houseId } = req.params;
    const userId = req.user.userId;

    console.log('🔍 Fetching family members for house:', houseId, 'user:', userId);

    // Get ALL tenants for this house
    const allTenants = await tenants.query()
      .where('house_id', houseId)
      .select('*');

    console.log('🏠 All tenants in house:', allTenants.length);

    // Filter for secondary tenants
    const secondaryTenants = allTenants.filter(tenant => {
      // Skip the current user
      if (tenant.user_id === userId) {
        return false;
      }
      
      // Check if this is a secondary tenant via pet_info
      if (tenant.pet_info) {
        try {
          const petInfo = JSON.parse(tenant.pet_info);
          if (petInfo.is_secondary) {
            return true;
          }
        } catch (e) {
          console.log('❌ Error parsing pet_info:', e);
        }
      }
      
      return false;
    });

    console.log('✅ Found secondary tenants:', secondaryTenants.length);

    // Get complete user details for each secondary tenant
    const formattedTenants = await Promise.all(
      secondaryTenants.map(async (tenant) => {
        try {
          // Get user details from users table
          const user = await users.query().findById(tenant.user_id);
          
          // Parse pet_info for additional data
          let petInfo = {};
          let relationship = 'Family Member';
          let temporary_password = '';

          if (tenant.pet_info) {
            try {
              petInfo = JSON.parse(tenant.pet_info);
              relationship = petInfo.relationship || relationship;
              temporary_password = petInfo.temporary_password || '';
            } catch (e) {
              console.log('❌ Error parsing pet_info:', e);
            }
        }

          // Extract relationship from emergency_contact as fallback
          if (tenant.emergency_contact && tenant.emergency_contact.includes(' of ')) {
            relationship = tenant.emergency_contact.split(' of ')[0] || relationship;
          }

          return {
            id: tenant.id,
            user_id: tenant.user_id,
            first_name: user?.first_name || petInfo.first_name || '',
            last_name: user?.last_name || petInfo.last_name || '',
            user_email: tenant.user_email,
            phone_number: user?.phone_number || petInfo.phone_number || '',
            relationship: relationship,
            status_id: tenant.status_id,
            temporary_password: temporary_password, // Include the password
            created_by: tenant.created_by,
            created_at: tenant.created_at,
            // Include all user details
            user_details: {
              national_id: user?.national_id,
              is_active: user?.is_active,
              created_at: user?.created_at
            }
          };
        } catch (error) {
          console.log('❌ Error processing tenant:', tenant.id, error);
          return null;
        }
      })
    );

    // Filter out any null results
    const validTenants = formattedTenants.filter(tenant => tenant !== null);

    console.log('📊 Final formatted tenants:', validTenants.length);
    validTenants.forEach(tenant => {
      console.log('👤 Tenant:', {
        id: tenant.id,
        name: `${tenant.first_name} ${tenant.last_name}`,
        email: tenant.user_email,
        relationship: tenant.relationship,
        has_password: !!tenant.temporary_password
      });
    });

    res.status(200).json({
      data: validTenants
    });

  } catch (error) {
    console.error('❌ Error fetching family members:', error);
    res.status(500).json({
      message: 'Error fetching family members',
      error: error.message,
      stack: error.stack
    });
  }
};



const getSecondaryTenantById = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const userId = req.user.userId;

    const secondaryTenant = await tenants.query().findById(tenantId);

    if (!secondaryTenant) {
      return res.status(404).json({
        message: 'Family member not found'
      });
    }

    // Verify the requesting user created this secondary tenant
    const mainTenant = await tenants.query()
      .where('id', secondaryTenant.created_by)
      .first();

    if (!mainTenant || mainTenant.user_id !== userId) {
      return res.status(403).json({
        message: 'Access denied to this family member'
      });
    }

    // Extract relationship info
    let relationship = 'Family Member';
    if (secondaryTenant.emergency_contact && secondaryTenant.emergency_contact.includes(' of ')) {
      relationship = secondaryTenant.emergency_contact.split(' of ')[0];
    }

    const formattedTenant = {
      id: secondaryTenant.id,
      first_name: secondaryTenant.first_name,
      last_name: secondaryTenant.last_name,
      user_email: secondaryTenant.user_email,
      phone_number: secondaryTenant.phone_number,
      relationship: relationship,
      status_id: secondaryTenant.status_id,
      user_id: secondaryTenant.user_id,
      house_id: secondaryTenant.house_id,
      created_at: secondaryTenant.created_at
    };

    res.status(200).json({
      data: formattedTenant
    });

  } catch (error) {
    console.error('❌ Error fetching family member:', error);
    res.status(500).json({
      message: 'Error fetching family member',
      error: error.message
    });
  }
};

const updateSecondaryTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const userId = req.user.userId;
    const { phone_number, relationship } = req.body;

    const secondaryTenant = await tenants.query().findById(tenantId);

    if (!secondaryTenant) {
      return res.status(404).json({
        message: 'Family member not found'
      });
    }

    // Verify the requesting user created this secondary tenant
    const mainTenant = await tenants.query()
      .where('id', secondaryTenant.created_by)
      .first();

    if (!mainTenant || mainTenant.user_id !== userId) {
      return res.status(403).json({
        message: 'Access denied to update this family member'
      });
    }

    const updates = {};
    
    // Update phone if provided
    if (phone_number) {
      updates.phone_number = phone_number;
    }

    // Update relationship in emergency_contact
    if (relationship) {
      updates.emergency_contact = `${relationship} of ${mainTenant.first_name} ${mainTenant.last_name}`;
      
      // Also update in pet_info
      let petInfo = {};
      try {
        petInfo = JSON.parse(secondaryTenant.pet_info || '{}');
      } catch (e) {
        petInfo = {};
      }
      petInfo.relationship = relationship;
      updates.pet_info = JSON.stringify(petInfo);
    }

    if (Object.keys(updates).length > 0) {
      await tenants.query().patch(updates).where('id', tenantId);
    }

    res.status(200).json({
      message: 'Family member updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating family member:', error);
    res.status(500).json({
      message: 'Error updating family member',
      error: error.message
    });
  }
};

const deleteSecondaryTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const userId = req.user.userId;

    const secondaryTenant = await tenants.query().findById(tenantId);

    if (!secondaryTenant) {
      return res.status(404).json({
        message: 'Family member not found'
      });
    }

    // Verify the requesting user created this secondary tenant
    const mainTenant = await tenants.query()
      .where('id', secondaryTenant.created_by)
      .first();

    if (!mainTenant || mainTenant.user_id !== userId) {
      return res.status(403).json({
        message: 'Access denied to remove this family member'
      });
    }

    // Soft delete by setting status to inactive
    await tenants.query().patch({ 
      status_id: 3, // Inactive status
      updated_at: new Date()
    }).where('id', tenantId);

    // Also deactivate the user account
    await users.query().patch({
      is_active: false,
      updated_at: new Date()
    }).where('id', secondaryTenant.user_id);

    res.status(200).json({
      message: 'Family member removed successfully'
    });

  } catch (error) {
    console.error('❌ Error removing family member:', error);
    res.status(500).json({
      message: 'Error removing family member',
      error: error.message
    });
  }
};

module.exports = {
  createSecondaryTenant,
  getSecondaryTenantsByHouse,
  getSecondaryTenantById,
  updateSecondaryTenant,
  deleteSecondaryTenant
};