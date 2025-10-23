'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('withdrawal_banks', [
      {
        bank_name: 'Chase Bank',
        required_fields: JSON.stringify([
          { name: 'account_number', label: 'Account Number', type: 'text', required: true },
          { name: 'routing_number', label: 'Routing Number', type: 'text', required: true },
          { name: 'account_holder_name', label: 'Account Holder Name', type: 'text', required: true }
        ]),
        notes: 'Primary withdrawal bank for USD transactions',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bank_name: 'Bank of America',
        required_fields: JSON.stringify([
          { name: 'account_number', label: 'Account Number', type: 'text', required: true },
          { name: 'routing_number', label: 'Routing Number', type: 'text', required: true },
          { name: 'account_holder_name', label: 'Account Holder Name', type: 'text', required: true }
        ]),
        notes: 'Secondary withdrawal bank for USD transactions',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        bank_name: 'Wells Fargo',
        required_fields: JSON.stringify([
          { name: 'account_number', label: 'Account Number', type: 'text', required: true },
          { name: 'routing_number', label: 'Routing Number', type: 'text', required: true },
          { name: 'account_holder_name', label: 'Account Holder Name', type: 'text', required: true }
        ]),
        notes: 'Backup withdrawal bank for USD transactions',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('withdrawal_banks', null, {});
  }
};
