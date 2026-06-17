import { expect } from "chai";
import hre from "hardhat";
import "@nomicfoundation/hardhat-chai-matchers";
import { MicroTune, MockERC20 } from "../typechain-types";

const DEFAULT_PRICE = hre.ethers.parseUnits("0.05", 18);
const TOTAL_BPS = 10_000n;

async function deployFixture() {
  const [owner, artist, producer, collab, listener] = await hre.ethers.getSigners();

  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const usdc = (await MockERC20.deploy("USDC", "USDC", 18)) as MockERC20;
  await usdc.waitForDeployment();

  const MicroTune = await hre.ethers.getContractFactory("MicroTune");
  const microTune = (await MicroTune.deploy(await usdc.getAddress(), DEFAULT_PRICE)) as MicroTune;
  await microTune.waitForDeployment();

  await usdc.mint(listener.address, hre.ethers.parseUnits("100", 18));

  return { microTune, usdc, owner, artist, producer, collab, listener };
}

describe("MicroTune", function () {
  it("should deploy with correct USDC and default price", async function () {
    const { microTune, usdc } = await deployFixture();
    expect(await microTune.usdc()).to.equal(await usdc.getAddress());
    expect(await microTune.defaultPrice()).to.equal(DEFAULT_PRICE);
  });

  it("should register a track with splits", async function () {
    const { microTune, artist, producer, collab } = await deployFixture();
    const tx = await microTune
      .connect(artist)
      .registerTrack(
        "Neon Dreams",
        "ipfs://QmTrack",
        DEFAULT_PRICE,
        [artist.address, producer.address, collab.address],
        [7000, 2000, 1000]
      );
    await expect(tx)
      .to.emit(microTune, "TrackRegistered")
      .withArgs(
        1,
        artist.address,
        "Neon Dreams",
        "ipfs://QmTrack",
        DEFAULT_PRICE,
        [artist.address, producer.address, collab.address],
        [7000, 2000, 1000]
      );

    const track = await microTune.getTrack(1);
    expect(track.title).to.equal("Neon Dreams");
    expect(track.artist).to.equal(artist.address);
    expect(track.beneficiaries).to.deep.equal([artist.address, producer.address, collab.address]);
    expect(track.shares.map((s) => Number(s))).to.deep.equal([7000, 2000, 1000]);
  });

  it("should reject invalid splits", async function () {
    const { microTune, artist, producer } = await deployFixture();
    await expect(
      microTune
        .connect(artist)
        .registerTrack(
          "Bad Split",
          "ipfs://bad",
          DEFAULT_PRICE,
          [artist.address, producer.address],
          [5000, 4000]
        )
    ).to.be.revertedWithCustomError(microTune, "InvalidSharesTotal");
  });

  it("should split a listen payment in real time", async function () {
    const { microTune, usdc, artist, producer, collab, listener } = await deployFixture();

    await microTune
      .connect(artist)
      .registerTrack(
        "Midnight Guitar",
        "ipfs://midnight",
        DEFAULT_PRICE,
        [artist.address, producer.address, collab.address],
        [7000, 2000, 1000]
      );

    await usdc.connect(listener).approve(await microTune.getAddress(), DEFAULT_PRICE);

    const artistBefore = await usdc.balanceOf(artist.address);
    const producerBefore = await usdc.balanceOf(producer.address);
    const collabBefore = await usdc.balanceOf(collab.address);

    await expect(microTune.connect(listener).listen(1))
      .to.emit(microTune, "Listened")
      .withArgs(1, listener.address, DEFAULT_PRICE, 1);

    const amount = DEFAULT_PRICE;
    const artistShare = (amount * 7000n) / TOTAL_BPS;
    const producerShare = (amount * 2000n) / TOTAL_BPS;
    const collabShare = (amount * 1000n) / TOTAL_BPS;

    expect(await usdc.balanceOf(artist.address)).to.equal(artistBefore + artistShare);
    expect(await usdc.balanceOf(producer.address)).to.equal(producerBefore + producerShare);
    expect(await usdc.balanceOf(collab.address)).to.equal(collabBefore + collabShare);

    const track = await microTune.getTrack(1);
    expect(track.totalListens).to.equal(1);
    expect(track.totalRevenue).to.equal(amount);

    expect(await microTune.getEarned(1, artist.address)).to.equal(artistShare);
    expect(await microTune.getEarned(1, producer.address)).to.equal(producerShare);
    expect(await microTune.getEarned(1, collab.address)).to.equal(collabShare);
  });

  it("should require USDC approval", async function () {
    const { microTune, artist, listener } = await deployFixture();
    await microTune
      .connect(artist)
      .registerTrack(
        "No Approval",
        "ipfs://no",
        DEFAULT_PRICE,
        [artist.address],
        [10000]
      );
    await expect(microTune.connect(listener).listen(1)).to.be.reverted;
  });

  it("should let artist update price", async function () {
    const { microTune, artist, producer } = await deployFixture();
    await microTune
      .connect(artist)
      .registerTrack(
        "Price Change",
        "ipfs://price",
        DEFAULT_PRICE,
        [artist.address, producer.address],
        [9000, 1000]
      );
    const newPrice = hre.ethers.parseUnits("0.10", 18);
    await microTune.connect(artist).setTrackPrice(1, newPrice);
    const track = await microTune.getTrack(1);
    expect(track.listenPrice).to.equal(newPrice);
  });
});
