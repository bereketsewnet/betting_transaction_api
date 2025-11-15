'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add indexes for better performance
    await queryInterface.addIndex('transactions', ['status_id', 'createdAt'], {
      name: 'idx_transactions_status_created'
    });

    await queryInterface.addIndex('transactions', ['assigned_agent_id'], {
      name: 'idx_transactions_assigned_agent'
    });

    await queryInterface.addIndex('transactions', ['player_profile_id'], {
      name: 'idx_transactions_player_profile'
    });

    await queryInterface.addIndex('transactions', ['transaction_uuid'], {
      name: 'idx_transactions_uuid'
    });

    await queryInterface.addIndex('player_profiles', ['player_uuid'], {
      name: 'idx_player_profiles_uuid'
    });

    await queryInterface.addIndex('player_profiles', ['telegram_id'], {
      name: 'idx_player_profiles_telegram_id'
    });

    await queryInterface.addIndex('refresh_tokens', ['token_hash'], {
      name: 'idx_refresh_tokens_hash'
    });

    await queryInterface.addIndex('refresh_tokens', ['expires_at'], {
      name: 'idx_refresh_tokens_expires'
    });

    await queryInterface.addIndex('audit_logs', ['entity', 'entity_id'], {
      name: 'idx_audit_logs_entity'
    });

    await queryInterface.addIndex('audit_logs', ['actor_user_id'], {
      name: 'idx_audit_logs_actor'
    });
  },

  async down(queryInterface, Sequelize) {
    // Helper function to check if index exists
    const indexExists = async (table, indexName) => {
      try {
        const [results] = await queryInterface.sequelize.query(
          `SHOW INDEXES FROM ${table} WHERE Key_name = '${indexName}'`
        );
        return results.length > 0;
      } catch (error) {
        return false;
      }
    };

    // Helper function to safely remove index (skip if used by foreign key or doesn't exist)
    const safeRemoveIndex = async (table, indexName) => {
      const exists = await indexExists(table, indexName);
      if (!exists) {
        console.log(`Index ${indexName} does not exist, skipping removal`);
        return;
      }
      
      try {
        await queryInterface.removeIndex(table, indexName);
      } catch (error) {
        // Index might be used by foreign key, skip it
        console.log(`Skipping ${indexName} removal: ${error.message}`);
      }
    };

    // Remove indexes (skip those used by foreign keys)
    await safeRemoveIndex('audit_logs', 'idx_audit_logs_actor');
    await safeRemoveIndex('audit_logs', 'idx_audit_logs_entity');
    await safeRemoveIndex('refresh_tokens', 'idx_refresh_tokens_expires');
    await safeRemoveIndex('refresh_tokens', 'idx_refresh_tokens_hash');
    await safeRemoveIndex('player_profiles', 'idx_player_profiles_telegram_id');
    await safeRemoveIndex('player_profiles', 'idx_player_profiles_uuid');
    await safeRemoveIndex('transactions', 'idx_transactions_uuid');
    await safeRemoveIndex('transactions', 'idx_transactions_player_profile');
    await safeRemoveIndex('transactions', 'idx_transactions_assigned_agent');
    await safeRemoveIndex('transactions', 'idx_transactions_status_created');
  }
};
