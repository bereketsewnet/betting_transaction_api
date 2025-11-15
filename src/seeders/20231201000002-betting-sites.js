'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const bettingSites = [
      {
        name: 'Arada Betting',
        description: 'Arada Betting Platform - Sports betting and casino games',
        website: 'https://arada-betting.com',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Bética Betting',
        description: 'Bética Betting Platform - Online sports betting',
        website: 'https://betica-betting.com',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Vamost Betting',
        description: 'Vamost Betting Platform - Live betting and casino',
        website: 'https://vamost-betting.com',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'SportBet Pro',
        description: 'SportBet Pro - Professional sports betting platform',
        website: 'https://sportbet-pro.com',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'WinMax Betting',
        description: 'WinMax Betting - Maximum winning opportunities',
        website: 'https://winmax-betting.com',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'LuckyStrike Casino',
        description: 'LuckyStrike Casino - Casino games and live betting',
        website: 'https://luckystrike-casino.com',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'BetKing Sports',
        description: 'BetKing Sports - King of sports betting',
        website: 'https://betking-sports.com',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'GoldenBet Casino',
        description: 'GoldenBet Casino - Premium casino experience',
        website: 'https://goldenbet-casino.com',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    // Check which sites already exist
    const existingSites = await queryInterface.sequelize.query(
      `SELECT name FROM betting_sites`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existingNames = existingSites.map(site => site.name);

    // Filter out sites that already exist
    const sitesToInsert = bettingSites.filter(site => !existingNames.includes(site.name));

    if (sitesToInsert.length > 0) {
      await queryInterface.bulkInsert('betting_sites', sitesToInsert);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('betting_sites', null, {});
  }
};
