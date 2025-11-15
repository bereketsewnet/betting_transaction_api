'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const banks = [
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
    ];

    // Check which banks already exist
    const existingBanks = await queryInterface.sequelize.query(
      `SELECT account_number FROM deposit_banks`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existingAccountNumbers = existingBanks.map(bank => bank.account_number);

    // Filter out banks that already exist
    const banksToInsert = banks.filter(bank => !existingAccountNumbers.includes(bank.account_number));

    if (banksToInsert.length > 0) {
      await queryInterface.bulkInsert('deposit_banks', banksToInsert, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('deposit_banks', null, {});
  }
};
