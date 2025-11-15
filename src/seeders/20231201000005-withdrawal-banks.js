'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const banks = [
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
    ];

    // Check which banks already exist
    const existingBanks = await queryInterface.sequelize.query(
      `SELECT bank_name FROM withdrawal_banks`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existingBankNames = existingBanks.map(bank => bank.bank_name);

    // Filter out banks that already exist
    const banksToInsert = banks.filter(bank => !existingBankNames.includes(bank.bank_name));

    if (banksToInsert.length > 0) {
      await queryInterface.bulkInsert('withdrawal_banks', banksToInsert, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('withdrawal_banks', null, {});
  }
};
