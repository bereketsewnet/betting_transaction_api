'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const roles = ['admin', 'agent', 'player'];

    for (const name of roles) {
      // Check if the role already exists
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM roles WHERE name = :name LIMIT 1;`,
        { replacements: { name } }
      );

      if (existing.length === 0) {
        // Insert role if not exists
        await queryInterface.bulkInsert('roles', [
          {
            name,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ], {});
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove roles safely
    await queryInterface.bulkDelete('roles', { name: ['admin', 'agent', 'player'] });
  }
};
