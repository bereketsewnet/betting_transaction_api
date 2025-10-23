'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('deposit_banks', [
      {
        bank_name: 'Chase Bank',
        account_number: '1234567890',
        account_name: 'Betting Payment Manager',
        notes: 'Primary deposit account for USD transactions',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bank_name: 'Bank of America',
        account_number: '0987654321',
        account_name: 'Betting Payment Manager',
        notes: 'Secondary deposit account for USD transactions',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bank_name: 'Wells Fargo',
        account_number: '1122334455',
        account_name: 'Betting Payment Manager',
        notes: 'Backup deposit account for USD transactions',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('deposit_banks', null, {});
  }
};
