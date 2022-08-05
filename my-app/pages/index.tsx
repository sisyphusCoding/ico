import { ethers, providers,BigNumber, utils, Contract, constants } from 'ethers'
import { useEffect, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Web3Modal from 'web3modal'

import {CONTRACT_ADDRESS,CONTRACT_ABI,NFT_CONTRACT_ABI,NFT_CONTRACT_ADDRESS} from '../constants'
const Home = ():JSX.Element=> {

  interface thisProvider extends providers.Web3Provider{
    getAddress(): Promise<string>
  }


  interface thisSigner extends providers.JsonRpcSigner{
    getAddress(): Promise<string>
  }

  const [network,setNetwork] = useState('')

  if(typeof window !== 'undefined'){
  const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    provider.on("network", (newNetwork, oldNetwork) => {
       
        if (oldNetwork) {
             //setNetwork(newNetwork.name)  
             //console.log(network)
            window.location.reload()
          
        }
    }) 
  }

  const zero = BigNumber.from(0)

  const [walletConnected,setWalletConnected] = useState<boolean>(false)

  const [tokensMinted ,setTokensMinted]  = useState(zero)
  
  const [balanceOfCurrent,setBalanceOfCurrent] = useState(zero)

  const [tokenAmount , setTokenAmount ] = useState(zero)

  const [loading ,setLoading] = useState<boolean>(false)

  const web3ModalRef  = useRef<Web3Modal>()



    const getProviderOrSigner = async(needSigner = false)=> {

    const provider = await web3ModalRef.current?.connect()

    const web3Provider = new providers.Web3Provider(provider)

    const {chainId} = await web3Provider.getNetwork()

    if(chainId === 4){ 
      toast.success('Network set to Rinkeby',{
        id:'errorAufNetzwerk'
      })
    } else{
      toast.error('Change Network to Rinkeby',{
        id:'errorAufNetzwerk'
      })
      throw new Error('Change network to rinkeby')
    }

    if(needSigner){
      const signer = web3Provider.getSigner() as thisSigner
      return signer
    }
    
    return web3Provider as thisProvider

  }

  const connectWallet = async() => {

    try{

      await getProviderOrSigner()
      setWalletConnected(true)

    }
    catch(error){console.log(error)}
  }


  useEffect(()=>{
    if(!walletConnected){ 
      web3ModalRef.current = new Web3Modal({
        network:'rinkeby',
        providerOptions:{},
        disableInjectedProvider:false
      })
      connectWallet()
    }  
  },[network])

  const getBalanceOfCryptoDevTokens = async() =>{
    try{
      const provider = await getProviderOrSigner()
      const tokenContract = new Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      )
    }
    catch(error){console.log(error)}
  }


  const getTotalTokenMinted = async() =>{
    try{

    }
    catch(error){console.log(error)}
  }


  const mintCryptoToken = async(amount:any) => {

    try{
      const signer  = await getProviderOrSigner(true) 
      const tokenContract = new Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      )
      const value = 0.001 * amount
      const txn = await tokenContract.mint(amount,{
        value: utils.parseEther(value.toString())
      })
      setLoading(true)
      await txn.wait()
      setLoading(false)
      toast.success(`Success fully minted ${amount} CryptoDev tokens`)
      
      await getBalanceOfCryptoDevTokens()
      await getTotalTokenMinted()

    }
    catch(error){console.log(error)}
  }

  const renderButton = () =>{ 
    return(
      <div>
       <input 
        type='number'
        placeholder='Amount of Tokens'
        onChange={(e)=>setTokenAmount(BigNumber.from(e.target.value))} />

      <button 

       className={`
        thisButton 
        ${!tokenAmount.gt(0)? 'cursor-not-allowed' :''}
        `}

       disabled={!(tokenAmount.gt(0))}
       onClick={()=>mintCryptoToken(tokenAmount)}
        >
          Mint Tokens
        </button>
      </div>
    )
    
  }
  return (
    <div className='
      flex flex-col items-center justify-center
      grow 
      rounded-2xl
      
      min-w-full
      '>
      <Toaster 
        position='top-left'
         toastOptions={{
          error:{
            iconTheme:{
            primary:'#eee',
            secondary:'#555'
            },
            style:{
              background:'#EB1D36',
              color:'#eee', 
            }
          }
        }}
         />
      <section
       className='flex flex-col'
       >
        <h1 
          className='
          text-2xl
          md:text-3xl
          lg:text-4xl
          '
          >
          Welcome to Crypto Devs ICO!
        </h1>
        <h2 
         className='
          tracking-tight
          text-lg 
          lg:text-2xl
          '
         >
          You can claim or mint CryptoDev tokens here.
        </h2>

      <div 
          className='
          py-5'
           >
          {walletConnected?
            <div>
              <p>
                You have minted <span>{utils.formatEther(balanceOfCurrent)}</span> Crypto Dev Tokens. 
              </p>
            <p>
             Overall 
             <span> {utils.formatEther(tokensMinted)}</span> 
              /1000 have been minted.     

            </p>
            </div>
          :

          <button 
          className='
          thisButton     
          '
           onClick={connectWallet}>
            Connect Wallet
              </button>
          }
          {renderButton()}
        </div>

      </section>
    </div>
  )
}

export default Home
