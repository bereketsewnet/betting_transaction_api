'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('betting_sites', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      website: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
      },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'created_at',
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'updated_at',
          },
    });

    // Add indexes
    await queryInterface.addIndex('betting_sites', ['is_active']);
  },

  down: async (queryInterface, Sequelize) => {
    // Check if foreign key constraint exists before dropping table
    const [constraints] = await queryInterface.sequelize.query(
      `SELECT CONSTRAINT_NAME 
       FROM information_schema.KEY_COLUMN_USAGE 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'transactions' 
       AND REFERENCED_TABLE_NAME = 'betting_sites'`
    );

    // Remove foreign key constraints if they exist
    if (constraints && constraints.length > 0) {
      for (const constraint of constraints) {
        await queryInterface.sequelize.query(
          `ALTER TABLE transactions DROP FOREIGN KEY ${constraint.CONSTRAINT_NAME}`
        );
      }
    }

    // Now safe to drop the table
    await queryInterface.dropTable('betting_sites');
  }
};
