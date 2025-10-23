'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
    const agentPasswordHash = await bcrypt.hash('AgentPass123!', 10);

    await queryInterface.bulkInsert('users', [
      {
        username: 'admin@example.com',
        email: 'admin@example.com',
        password_hash: adminPasswordHash,
        role_id: 1, // admin role
        display_name: 'System Administrator',
        phone: '+1234567890',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        username: 'agent@example.com',
        email: 'agent@example.com',
        password_hash: agentPasswordHash,
        role_id: 2, // agent role
        display_name: 'Support Agent',
        phone: '+1234567891',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
