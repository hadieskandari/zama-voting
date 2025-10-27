/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require('dotenv').config();

// Load private key from environment variable or use a default one for testing
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || '0xcb763b314bfa8508f4fe7d1e4a79af1b51233dda4c1295f8bf7e49f3ccea135b';

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    baseSepolia: {
      url: 'https://sepolia.base.org',
      accounts: [PRIVATE_KEY],
      chainId: 84532,
      verify: {
        etherscan: {
          apiUrl: "https://api-sepolia.basescan.org",
        },
      },
    }
  }
};