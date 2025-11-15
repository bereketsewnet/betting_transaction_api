'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const statuses = [
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
    ];

    // Check which statuses already exist
    const existingStatuses = await queryInterface.sequelize.query(
      `SELECT code FROM transaction_statuses`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existingCodes = existingStatuses.map(status => status.code);

    // Filter out statuses that already exist
    const statusesToInsert = statuses.filter(status => !existingCodes.includes(status.code));

    if (statusesToInsert.length > 0) {
      await queryInterface.bulkInsert('transaction_statuses', statusesToInsert, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('transaction_statuses', null, {});
  }
};
