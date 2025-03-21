const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token contract", function () {
  let Token, token, owner, addr1, addr2;

  const initialSupply = 1000000;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    Token = await ethers.getContractFactory("Token");
    token = await Token.deploy(initialSupply);
    await token.waitForDeployment();
  });

  it("Should assign the total supply of tokens to the owner", async function () {
    const ownerBalance = await token.balanceOf(owner.address);
    const totalSupply = await token.totalSupply();
    expect(ownerBalance).to.equal(totalSupply);
  });

  it("Should transfer tokens between accounts", async function () {
    await token.transfer(addr1.address, 1000);
    const addr1Balance = await token.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(1000);
  });

  it("Should update balances after transfers", async function () {
    await token.transfer(addr1.address, 1000);
    await token.connect(addr1).transfer(addr2.address, 500);

    const addr1Balance = await token.balanceOf(addr1.address);
    const addr2Balance = await token.balanceOf(addr2.address);

    expect(addr1Balance).to.equal(500);
    expect(addr2Balance).to.equal(500);
  });
});
