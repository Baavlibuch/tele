// Setup file for Jest with Puppeteer
const { setup: setupPuppeteer } = require('jest-puppeteer/setup');

module.exports = async function globalSetup(globalConfig) {
  // Setup Puppeteer
  await setupPuppeteer(globalConfig);
  
  // Additional global setup can go here
  console.log('Global setup completed');
};
