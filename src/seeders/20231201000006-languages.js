'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const languages = [
      {
        code: 'en',
        name: 'English (US)',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'am',
        name: 'Amharic (Ethiopia)',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Check which languages already exist
    const existingLanguages = await queryInterface.sequelize.query(
      `SELECT code FROM languages`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existingCodes = existingLanguages.map(lang => lang.code);

    // Filter out languages that already exist
    const languagesToInsert = languages.filter(lang => !existingCodes.includes(lang.code));

    if (languagesToInsert.length > 0) {
      await queryInterface.bulkInsert('languages', languagesToInsert, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('languages', null, {});
  }
};
