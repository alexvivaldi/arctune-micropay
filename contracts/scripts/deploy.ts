import hre from "hardhat";
import fs from "fs";
import path from "path";

const ARC_USDC = "0x3600000000000000000000000000000000000000";
const DEFAULT_PRICE = hre.ethers.parseUnits("0.05", 18);

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;
  const chainId = Number(await hre.network.provider.send("eth_chainId"));
  console.log(`Deploying from ${deployer.address} on ${network} (chainId ${chainId})`);

  let usdcAddress = process.env.USDC_ADDRESS;

  if (!usdcAddress) {
    if (network === "hardhat" || network === "localhost") {
      const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
      const mock = await MockERC20.deploy("USDC", "USDC", 18);
      await mock.waitForDeployment();
      usdcAddress = await mock.getAddress();
      console.log(`Deployed MockERC20 at ${usdcAddress}`);
    } else {
      usdcAddress = ARC_USDC;
      console.log(`Using Arc Testnet native USDC at ${usdcAddress}`);
    }
  }

  const MicroTune = await hre.ethers.getContractFactory("MicroTune");
  const microTune = await MicroTune.deploy(usdcAddress, DEFAULT_PRICE);
  await microTune.waitForDeployment();

  const address = await microTune.getAddress();
  console.log(`MicroTune deployed at ${address}`);
  console.log(`USDC token: ${usdcAddress}`);
  console.log(`Listen price: ${DEFAULT_PRICE.toString()} (${hre.ethers.formatUnits(DEFAULT_PRICE, 18)} USDC)`);

  // Write deployment metadata
  const root = path.resolve(__dirname, "..");
  const deployPath = path.join(root, "deployments", `${network}.json`);
  fs.mkdirSync(path.dirname(deployPath), { recursive: true });
  fs.writeFileSync(
    deployPath,
    JSON.stringify(
      {
        network,
        chainId,
        contract: "MicroTune",
        address,
        usdc: usdcAddress,
        price: DEFAULT_PRICE.toString(),
        deployedAt: new Date().toISOString(),
        deployer: deployer.address,
      },
      null,
      2
    )
  );
  console.log(`Deployment metadata saved to ${deployPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
