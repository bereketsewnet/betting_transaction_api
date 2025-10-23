'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('transaction_statuses', [
      {
        code: 'PENDING',
        label: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'IN_PROGRESS',
        label: 'In Progress',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'SUCCESS',
        label: 'Success',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'FAILED',
        label: 'Failed',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'CANCELLED',
        label: 'Cancelled',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('transaction_statuses', null, {});
  }
};
