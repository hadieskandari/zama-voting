const deploymentConfig = {
  // Private key of the deployer account, beginning with 0x
  deployerPrivateKey: '0xcb763b314bfa8508f4fe7d1e4a79af1b51233dda4c1295f8bf7e49f3ccea135b',

  // Full URL such as https://abc123.multibaas.com
  deploymentEndpoint: 'https://h47wubb4yffn5ne4pazqnc7oti.multibaas.com',

  // API key to access MultiBaas web3 endpoint
  // Note that the API key MUST be part of the "Web3" group
  // Create one on MultiBaas via navigation bar > Admin > API Keys
  web3Key:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzYxNTkxOTg2LCJqdGkiOiI2Y2M1NTVmMy00MjJhLTQ4OGQtYmYxNi03MGQ2ZTI4ZWMwNTgifQ.YrNtxZ8BtWmJp-LSd8rkr7uDvXNBwxn_-IluVQh9Kv0',

  // RPC URL of the blockchain network is required if a web3Key is not provided
  // This is required for networks that where MultiBaas does not support the web3 proxy feature
  rpcUrl: 'https://rpc.sepolia.org', // Sepolia RPC URL as backup

  // API key to access MultiBaas from deployer
  // Note that the API key MUST be part of the "Administrators" group
  // Create one on MultiBaas via navigation bar > Admin > API Keys
  adminApiKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzYxNTkxOTg2LCJqdGkiOiI2Y2M1NTVmMy00MjJhLTQ4OGQtYmYxNi03MGQ2ZTI4ZWMwNTgifQ.YrNtxZ8BtWmJp-LSd8rkr7uDvXNBwxn_-IluVQh9Kv0',
};

module.exports = {
  deploymentConfig,
};
