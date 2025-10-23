'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('languages', [
      {
        code: 'en',
        name: 'English',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'es',
        name: 'Spanish',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'fr',
        name: 'French',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('languages', null, {});
  }
};
