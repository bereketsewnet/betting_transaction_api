'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Generate password hashes
    const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
    const agentPasswordHash = await bcrypt.hash('AgentPass123!', 10);

    // Fetch role IDs dynamically
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles WHERE name IN ('admin', 'agent');`
    );

    const adminRole = roles.find(r => r.name === 'admin');
    const agentRole = roles.find(r => r.name === 'agent');

    if (!adminRole || !agentRole) {
      throw new Error('Required roles (admin, agent) not found in roles table. Run roles seeder first.');
    }

    // Check if users already exist
    const [existingUsers] = await queryInterface.sequelize.query(
      `SELECT username FROM users WHERE username IN ('admin@example.com', 'agent@example.com');`
    );

    const usernames = existingUsers.map(u => u.username);

    const usersToInsert = [];

    if (!usernames.includes('admin@example.com')) {
      usersToInsert.push({
        username: 'admin@example.com',
        email: 'admin@example.com',
        password_hash: adminPasswordHash,
        role_id: adminRole.id,
        display_name: 'System Administrator',
        phone: '+1234567890',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    if (!usernames.includes('agent@example.com')) {
      usersToInsert.push({
        username: 'agent@example.com',
        email: 'agent@example.com',
        password_hash: agentPasswordHash,
        role_id: agentRole.id,
        display_name: 'Support Agent',
        phone: '+1234567891',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    if (usersToInsert.length > 0) {
      await queryInterface.bulkInsert('users', usersToInsert, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { username: ['admin@example.com', 'agent@example.com'] });
  }
};
