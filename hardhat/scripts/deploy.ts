import { ethers } from "hardhat";
import * as dotenv from 'dotenv' 

const {THIS_NFT_ADDRESS} = require('../constants')

const main = async () => {

  const cryptoDevsNFTContract =  THIS_NFT_ADDRESS
 
  const cryptoDevsTokenContract = await ethers.getContractFactory('CryptoDevToken')

  const thisDeployed = await cryptoDevsTokenContract.deploy(cryptoDevsNFTContract)

  console.log('CryptoDevs Token Contract Address :',
  thisDeployed.address            
  )

}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
