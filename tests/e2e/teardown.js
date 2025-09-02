// Teardown file for Jest with Puppeteer
const { teardown: teardownPuppeteer } = require('jest-puppeteer/teardown');

module.exports = async function globalTeardown(globalConfig) {
  // Teardown Puppeteer
  await teardownPuppeteer(globalConfig);
  
  // Additional global teardown can go here
  console.log('Global teardown completed');
};
