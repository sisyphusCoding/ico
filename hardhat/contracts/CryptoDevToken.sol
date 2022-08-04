//SPDX-License-Identifier:MIT


pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

import './ICryptoDev.sol';



contract CryptoDevToken is ERC20 , Ownable {


  uint256 public constant tokenPrice = 0.001 ether;

  mapping (uint256 => bool) tokenIdsClaimed;

  ICryptoDev CryptoDevsNFT;

  constructor(address _cryptoDevsContract) ERC20('Crypt Dev Token' , 'CD') {
    CryptoDevsNFT = ICryptoDev(_cryptoDevsContract);
  }

  

  function mint(uint256 amount) public payable{

    uint256 _requiredAmount = tokenPrice * amount;

    require( msg.value >= _requiredAmount,'Ether sent is scant');
   
    uint256 amountWithDecimals = amount * 10**18;

    require((
      totalSupply() + amountWithDecimals <= maxTotalSupply,
      "Exceeded the maximum total supply"
    ));

    _mint(msg.sender , amountWithDecimals);

  }

  function claim() public {

    address sender = msg.sender;

    uint256 balance = CryptoDevsNFT.balanceOf(sender);

    require(balance > 0 , "You don't own any CryptoDevNFT's ");
    
    uint256 amount = 0;

    for(uint256 i = 0; i < balance; i++){
    uint256 tokenId = CryptoDevsNFT.tokenOwnerByIndex(sender, i);

      if(!tokenIdsClaimed[tokenId]){
          amount +=1;
          tokenIdsClaimed[tokenId] = true;
      }
    }    
  }


  function withdraw() public onlyOwner {
    address _owner = owner();
    uint256 amount = address(this).balance;
    (bool sent , ) = _owner.call{value:amount}('');
    require(sent,'Failed to sedn Ether');
  }


  receive() external payable{}

  fallback() external payable{}



}
