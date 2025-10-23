'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add betting site fields to transactions table
    await queryInterface.addColumn('transactions', 'betting_site_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'betting_sites',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('transactions', 'player_site_id', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    // Add indexes
    await queryInterface.addIndex('transactions', ['betting_site_id']);
    await queryInterface.addIndex('transactions', ['player_site_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('transactions', 'betting_site_id');
    await queryInterface.removeColumn('transactions', 'player_site_id');
  }
};
