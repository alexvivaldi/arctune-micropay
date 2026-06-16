import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";

const ARC_RPC = vars.get("ARC_RPC", "https://rpc.testnet.arc.network");
const ARC_PRIVATE_KEY = vars.get("ARC_PRIVATE_KEY", "0x0000000000000000000000000000000000000000000000000000000000000000");

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    arctestnet: {
      url: ARC_RPC,
      chainId: 5042002,
      accounts: [ARC_PRIVATE_KEY],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
