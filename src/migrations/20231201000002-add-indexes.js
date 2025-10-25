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
    await queryInterface.removeIndex('audit_logs', 'idx_audit_logs_actor');
    await queryInterface.removeIndex('audit_logs', 'idx_audit_logs_entity');
    await queryInterface.removeIndex('refresh_tokens', 'idx_refresh_tokens_expires');
    await queryInterface.removeIndex('refresh_tokens', 'idx_refresh_tokens_hash');
    await queryInterface.removeIndex('player_profiles', 'idx_player_profiles_telegram_id');
    await queryInterface.removeIndex('player_profiles', 'idx_player_profiles_uuid');
    await queryInterface.removeIndex('transactions', 'idx_transactions_uuid');
    await queryInterface.removeIndex('transactions', 'idx_transactions_player_profile');
    await queryInterface.removeIndex('transactions', 'idx_transactions_assigned_agent');
    await queryInterface.removeIndex('transactions', 'idx_transactions_status_created');
  }
};
