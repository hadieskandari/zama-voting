const deploymentConfig = {
  // Private key of the deployer account, beginning with 0x
  deployerPrivateKey: '0xcb763b314bfa8508f4fe7d1e4a79af1b51233dda4c1295f8bf7e49f3ccea135b',

  // Full URL such as https://abc123.multibaas.com
  deploymentEndpoint: 'https://vzt6d2cwzbbw7n2kw4i5u25lsq.multibaas.com',

  // API key to access MultiBaas web3 endpoint
  // Note that the API key MUST be part of the "Web3" group
  // Create one on MultiBaas via navigation bar > Admin > API Keys
  web3Key:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU3Mjc1MDkwLCJqdGkiOiIzOGRlNGRiZC04MTlhLTQ1MDMtYmI4Ni04YjM5MDQ3Nzc2ZDAifQ.HhbawpLFl0T9g6u-X98lrjh0FYM3tsES1VoaYkx07qE',

  // RPC URL of the blockchain network is required if a web3Key is not provided
  // This is required for networks that where MultiBaas does not support the web3 proxy feature
  rpcUrl: '',

  // API key to access MultiBaas from deployer
  // Note that the API key MUST be part of the "Administrators" group
  // Create one on MultiBaas via navigation bar > Admin > API Keys
  adminApiKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU3Mjc1MDkwLCJqdGkiOiIzOGRlNGRiZC04MTlhLTQ1MDMtYmI4Ni04YjM5MDQ3Nzc2ZDAifQ.HhbawpLFl0T9g6u-X98lrjh0FYM3tsES1VoaYkx07qE',
};

module.exports = {
  deploymentConfig,
};
