'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('templates', [
      {
        language_code: 'en',
        key_name: 'welcome_message',
        content: 'Welcome to Betting Payment Manager! 🎉\n\nI\'m here to help you with your deposit and withdrawal transactions. You can:\n\n💰 Make deposits\n💸 Request withdrawals\n📊 Check transaction status\n\nType /help for more information or /start to begin!',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'transaction_created',
        content: '✅ Your transaction has been created successfully!\n\nTransaction ID: {transaction_uuid}\nType: {type}\nAmount: {amount} {currency}\nStatus: {status}\n\nWe\'ll process your request shortly. You\'ll receive updates as we work on it.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'en',
        key_name: 'transaction_processed',
        content: '🎉 Your transaction has been processed!\n\nTransaction ID: {transaction_uuid}\nStatus: {status}\n\n{agent_notes}\n\nThank you for using our service!',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        language_code: 'es',
        key_name: 'welcome_message',
        content: '¡Bienvenido al Gestor de Pagos de Apuestas! 🎉\n\nEstoy aquí para ayudarte con tus transacciones de depósito y retiro. Puedes:\n\n💰 Hacer depósitos\n💸 Solicitar retiros\n📊 Verificar el estado de transacciones\n\nEscribe /help para más información o /start para comenzar!',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('templates', null, {});
  }
};
