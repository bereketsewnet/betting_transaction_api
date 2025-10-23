'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('betting_sites', [
      {
        name: 'Arada Betting',
        description: 'Arada Betting Platform - Sports betting and casino games',
        website: 'https://arada-betting.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Bética Betting',
        description: 'Bética Betting Platform - Online sports betting',
        website: 'https://betica-betting.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Vamost Betting',
        description: 'Vamost Betting Platform - Live betting and casino',
        website: 'https://vamost-betting.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'SportBet Pro',
        description: 'SportBet Pro - Professional sports betting platform',
        website: 'https://sportbet-pro.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'WinMax Betting',
        description: 'WinMax Betting - Maximum winning opportunities',
        website: 'https://winmax-betting.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'LuckyStrike Casino',
        description: 'LuckyStrike Casino - Casino games and live betting',
        website: 'https://luckystrike-casino.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'BetKing Sports',
        description: 'BetKing Sports - King of sports betting',
        website: 'https://betking-sports.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'GoldenBet Casino',
        description: 'GoldenBet Casino - Premium casino experience',
        website: 'https://goldenbet-casino.com',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('betting_sites', null, {});
  }
};
