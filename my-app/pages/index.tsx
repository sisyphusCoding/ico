import Image from 'next/image'
import {
  ethers,
  providers,
  BigNumber,
  utils,
  Contract,
  constants
} from 'ethers'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Web3Modal from 'web3modal'
import{BiPlug} from 'react-icons/bi'
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  NFT_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS
} from '../constants'
import { sign } from 'crypto'
import { walletconnect } from 'web3modal/dist/providers/connectors'
import { AnimatePresence ,motion } from 'framer-motion'
const Home = (): JSX.Element => {
  interface thisProvider extends providers.Web3Provider {
    getAddress(): Promise<string>
  }

  interface thisSigner extends providers.JsonRpcSigner {
    getAddress(): Promise<string>
  }

  const [network, setNetwork] = useState('')

  const [imageLoaded,setImageLoaded] = useState<boolean>(false)
  if (typeof window !== 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum, 'any')
    provider.on('network', (newNetwork, oldNetwork) => {
      if (oldNetwork) {
        //setNetwork(newNetwork.name)
        //console.log(network)
        window.location.reload()
      }
    })
  }

  const zero = BigNumber.from(0)

  const [walletConnected, setWalletConnected] = useState<boolean>(false)

  const [tokensMinted, setTokensMinted] = useState(zero)

  const [balanceOfCurrent, setBalanceOfCurrent] = useState(zero)

  const [tokenAmount, setTokenAmount] = useState(zero)

  const [loading, setLoading] = useState<boolean>(false)

  const [tokensToBeClaimed,setTokensToBeClaimed] = useState<any>(zero)

  const web3ModalRef = useRef<Web3Modal>()

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current?.connect()

    const web3Provider = new providers.Web3Provider(provider)

    const { chainId } = await web3Provider.getNetwork()

    if (chainId === 4) {
      toast.success('Network set to Rinkeby', {
        id: 'errorAufNetzwerk'
      })
    } else {
      toast.error('Change Network to Rinkeby', {
        id: 'errorAufNetzwerk'
      })
      throw new Error('Change network to rinkeby')
    }

    if (needSigner) {
      const signer = web3Provider.getSigner() as thisSigner
      return signer
    }

    return web3Provider as thisProvider
  }

  const connectWallet = async () => {
    try {
      await getProviderOrSigner()
      setWalletConnected(true)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: 'rinkeby',
        providerOptions: {},
        disableInjectedProvider: false
      })
      connectWallet()      
       getBalanceOfCryptoDevTokens()
       getTotalTokensMinted()
       getTokensToBeClaimed()
    }
  }, [walletConnected])


  const getTokensToBeClaimed = async() => {
    try{
        const provider = await getProviderOrSigner()

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      )

      const signer = await getProviderOrSigner(true)

      const address = await signer.getAddress()
      const balance = await nftContract.balanceOf(address)

      const tokenContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      )

      if(balance ===zero){
        setTokensMinted(zero)
      }else{


        var amount = 0;

        for(var i =0;i<balance;i++){

          const tokenId = await nftContract.tokenOfOwnerByIndex(address,i)

          const claimed = await tokenContract.tokenIdsClaimed(tokenId)

          if(!claimed){
            amount++
          }
        }
      }
    }
    catch(error){
      console.log(error)
      setTokensMinted(zero)
    }
  }

  const getBalanceOfCryptoDevTokens = async () => {
    try {
      const provider = await getProviderOrSigner()
      const tokenContract = new Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      )

      const signer  = await getProviderOrSigner(true)
      const address = signer.getAddress()
      const balance = await tokenContract.balanceOf(address)  
      setBalanceOfCurrent(balance) 

    } catch(error){
      console.log(error)
    }
  }

  const getTotalTokensMinted = async () => {
    try {
      const provider  = await getProviderOrSigner()

      const tokenContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      )
      const _tokensMinted = await tokenContract.totalSupply()
      setTokensMinted(_tokensMinted)


    } catch (error) {
      console.log(error)
    }
  }

  const mintCryptoToken = async (amount: any) => {
    try {

      setLoading(true)
      const signer = await getProviderOrSigner(true)
      const tokenContract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      const value = 0.001 * amount
      const txn = await tokenContract.mint(amount, {
        value: utils.parseEther(value.toString())
      })
      await txn.wait()
      setLoading(false)
      toast.success(`Success fully minted ${amount} CryptoDev tokens`)
      await getBalanceOfCryptoDevTokens()
      await getTotalTokensMinted()
      await getTokensToBeClaimed()
    } catch (error) {
      console.log(error)
    }
  }


  const claimCryptoDevTokens = async() => {
    try{
     const signer = await getProviderOrSigner(true)  

      const tokenContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      )

      const txn = await tokenContract.claim()
      setLoading(true)
      await txn.wait()
      setLoading(false)
      toast.success('Successfully calimed CryptoDev Token')
      
      await getBalanceOfCryptoDevTokens()
      await getTotalTokensMinted()
      await getTokensToBeClaimed()

    }
    catch(error){
      console.log(error)
    }
  }

  const renderButton = () => {
    if(loading){
      return(
        <div
          style={{aspectRatio:'1'}}
          className='
          animate-spin
          bg-transparent
          rounded-full
          border-4 border-l-stone-700
          h-[4vmin]
          '
          />
      )
    }

    if(tokensToBeClaimed > 0){
      return(
      <div 
         >
          <p>
            {tokensToBeClaimed*10} Tokens can be claimed!
          </p>
          <button 
            onClick={claimCryptoDevTokens}
           className='thisButton mt-3'>
            Claim Tokens
          </button>
      </div>
      )
    }

    return (
      <div>
        <input
          type="number"
          placeholder="Amount of Tokens"
          onChange={e => setTokenAmount(BigNumber.from(e.target.value))}
        />
        <button
        className={`
        thisButton 
        ${!tokenAmount.gt(0) ? 'cursor-not-allowed' : ''}
        `}
          disabled={!tokenAmount.gt(0)}
          onClick={() => mintCryptoToken(tokenAmount)}
        >
          Mint Tokens
        </button>
      </div>
    )
  }
  return (
    <div
      className="
      md:max-w-fit
      max-w-[90vmin] 
      p-[5vmin]
      flex 
      shadow-2xl
      md:flex-row
      flex-col items-center justify-between
      gap-[10vmin]
      rounded-3xl 
      "
    >
      <Toaster
        position="top-left"
        toastOptions={{
          error: {
            iconTheme: {
              primary: '#eee',
              secondary: '#555'
            },
            style: {
              background: '#EB1D36',
              color: '#eee'
            }
          }
        }}
      />
      <section className="

        p-[5vmin]
        rounded-2xl
        thisNeo
        min-h-[55vmin]
        grow
        gap-5
        flex flex-col">
        <h1
          className="
          text-2xl
          md:text-3xl
          lg:text-4xl
          "
        >
          Welcome to Crypto Devs ICO!
        </h1>
        <h2
          className="
          tracking-tight
          text-lg 
          lg:text-2xl
          "
        >
          You can claim or mint CryptoDev tokens here.
        </h2>

        <div
          className="
          flex flex-col 
          items-start
          justify-start
          grow
        "
        >
          {walletConnected ? (
            <div
             className='
              flex 
              gap-5
              flex-col '
             >
              <p>
                You have minted{' '}
                <span>{utils.formatEther(balanceOfCurrent)}</span> Crypto Dev
                Tokens.
              </p>
              <p>
                Overall
                <span> {utils.formatEther(tokensMinted)}</span>
                /1000 have been minted.
              </p>
            {renderButton()}
            </div>
          ) : (
            <button
              className="
          thisButton  flex items-center justify-center gap-3
          "
              onClick={connectWallet}
            >
               <BiPlug/> <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </section>
        <section
        className='
        rounded-xl
        p-5
        relative
        grid place-items-center
        dark:brightness-90
        min-w-[50vmin]'>
          <motion.p 
            style={{aspectRatio:'1'}}
             className={`
          transition-all ease duration-700 delay-500

          ${!imageLoaded? 'opacity-100  ':'opacity-0 '}
                rounded-full
                animate-spin
                border-4 border-zinc-600 border-l-zinc-50
              h-[7vmin] absolute
          `}
             />
        <div 
          className='min-w-full overflow-hidden'>
        <Image
          className={`
          transition-all ease-out-sine duration-1000 delay-1000
          ${imageLoaded? 'opacity-100 blur-0 translate-y-0':' translate-y-full opacity-0 blur-md'}
          `}
          onLoad={()=>{setImageLoaded(true)}}
         layout='responsive' 
          objectFit='contain'
        alt='header'
        height={100} width={100}
        src={'/cryptodev.svg'}/> 
        </div>
      </section>
    </div>
  )
}

export default Home
