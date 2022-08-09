import Image from 'next/image'
import { HiPlus, HiMinus } from 'react-icons/hi'
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
import { BiFace, BiPlug } from 'react-icons/bi'
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  NFT_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS
} from '../constants'
import { sign } from 'crypto'
import { walletconnect } from 'web3modal/dist/providers/connectors'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import { Console } from 'console'
import { get } from 'http'
import { getMaxListeners } from 'process'
const Home = (): JSX.Element => {
  if (typeof window !== 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum, 'any')
    provider.on('network', (newNetwork, oldNetwork) => {
      if (oldNetwork) {
        window.location.reload()
        console.log(oldNetwork, 'oldNetwork')
      }
    })
  }

  interface thisProvider extends providers.Web3Provider {
    getAddress(): Promise<string>
  }

  interface thisSigner extends providers.JsonRpcSigner {
    getAddress(): Promise<string>
  }

  const [imageLoaded, setImageLoaded] = useState<boolean>(false)
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

  const [tokensToBeClaimed, setTokensToBeClaimed] = useState<any>(zero)

  const [isOwner, setIsOwner] = useState<boolean>(false)

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
      getTotalTokensMinted()
      getBalanceOfCryptoDevTokens()
      getTokensToBeClaimed()
      withdrawCoins()
    }
  }, [walletConnected])

  const getTokensToBeClaimed = async () => {
    try {
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
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      )
      console.log(balance.toNumber(), 'h')
      if (balance === zero) {
        setTokensToBeClaimed(zero)
      } else {
        var amount = 0

        for (let i = 0; i < balance; i++) {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i)
          const claimed = await tokenContract.tokenIdsClaimed(tokenId)
          if (!claimed) {
            amount++
          }
        }
        setTokensToBeClaimed(BigNumber.from(amount))
      }
    } catch (error) {
      console.log(error, 'from getTokensToBeClaimed')
      setTokensToBeClaimed(zero)
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

      const signer = await getProviderOrSigner(true)
      const address = signer.getAddress()
      const balance = await tokenContract.balanceOf(address)
      setBalanceOfCurrent(balance)
    } catch (error) {
      console.log(error)
    }
  }

  const getTotalTokensMinted = async () => {
    try {
      const provider = await getProviderOrSigner()

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
    setLoading(true)
    try {
      const signer = await getProviderOrSigner(true)
      const tokenContract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      const value = 0.001 * amount
      const txn = await tokenContract.mint(amount, {
        value: utils.parseEther(value.toString())
      })
      await txn.wait()
      toast.success(`Success fully minted ${amount} CryptoDev tokens`)
      await getBalanceOfCryptoDevTokens()
      await getTotalTokensMinted()
      await getTokensToBeClaimed()
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }

  const claimCryptoDevTokens = async () => {
    setLoading(true)

    try {
      const signer = await getProviderOrSigner(true)

      const tokenContract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

      const txn = await tokenContract.claim()

      await txn.wait()

      toast.success('Successfully calimed CryptoDev Token')

      await getBalanceOfCryptoDevTokens()
      await getTotalTokensMinted()
      await getTokensToBeClaimed()
    } catch (error) {
      console.log(error)
    }

    setLoading(false)
  }

  const thisInputRef = useRef<HTMLInputElement>(null)

  const handleAdd = () => {
    setTokenAmount(BigNumber.from(1))
  }

  useEffect(() => {
    if (thisInputRef.current) {
      thisInputRef.current.value = tokenAmount.toNumber().toString()
    }
  }, [tokenAmount])

  const handleMath = (minus = false) => {
    let thisCurrent: number = tokenAmount.toNumber()
    if (minus) {
      if (thisCurrent === 0) return
      thisCurrent--
    } else {
      thisCurrent++
    }
    setTokenAmount(BigNumber.from(thisCurrent))
  }

  const getOwner = async () => {
    try {
      const provider = await getProviderOrSigner()

      const tokenContract = new Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      )

      const _owner = await tokenContract.owner()

      const signer = await getProviderOrSigner(true)

      const _address = await signer.getAddress()

      if (_address.toLowerCase() === _owner.toLowerCase()) {
        console.log(_address.toLowerCase(), _owner.toLowerCase())
        setIsOwner(true)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const withdrawCoins = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const tokenContract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      const txn = await tokenContract.withdraw()
      await txn.wait()
      await getOwner()
    } catch (error) {
      console.log(error)
    }
  }

  const addButtonV: Variants = {
    initial: { y: -100, opacity: 0 },
    show: { y: 0, opacity: 1 },
    exit: { y: 100, opacity: 0 }
  }

  const numV: Variants = {
    initial: { y: 100, opacity: 0 },
    show: { y: 0, opacity: 1 },
    exit: { y: -100, opacity: 0 }
  }

  const parentV: Variants = {
    initial: { opacity: 1 },

    show: { opacity: 1 },

    exit: { opacity: 1 }
  }

  const leftV: Variants = {
    initial: { x: '-100%', opacity: 0 },
    show: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 }
  }

  const rightV: Variants = {
    initial: { x: '100%', opacity: 0 },
    show: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 }
  }

  const mintToken: Variants = {
    initial: { y: '50vh', opacity: 0 },
    show: { y: 0, opacity: 1 },
    exit: { y: '50vh', opacity: 0 }
  }

  const renderButton = () => {
    if (loading) {
      return (
        <div
          className="
          animate-spin
          bg-transparent
          rounded-full
          border-4 border-l-stone-700
          h-[4vmin] w-[4vmin]
          "
        />
      )
    }

    if (walletConnected && isOwner) {
      return (
        <div>
          <button className="thisButton" onClick={withdrawCoins}>
            Widthdraw Coins
          </button>
        </div>
      )
    }

    if (tokensToBeClaimed.toNumber() > 0) {
      return (
        <div>
          <p>{tokensToBeClaimed * 10} Tokens can be claimed!</p>
          <button onClick={claimCryptoDevTokens} className="thisButton mt-3">
            Claim Tokens
          </button>
        </div>
      )
    }

    return (
      <div
        className=" 
        overflow-hidden
        grow
        flex items-start justify-between
        gap-[5vmin]
        pl-1
        min-w-full "
      >
        <div
          className="    
          rounded-xl
          overflow-hidden
          bg-sky-500
          md:h-12
          h-10  
          w-2/5
          flex items-center justify-center
          dark:bg-sky-800
          shadow-[0_5px_15px_-7.5px_black]
          "
        >
          <AnimatePresence exitBeforeEnter>
            {tokenAmount.toNumber() === 0 ? (
              <motion.div
                key={tokenAmount.toNumber()}
                variants={addButtonV}
                transition={{ type: 'spring', damping: 15 }}
                initial="initial"
                animate="show"
                exit="exit"
                whileHover={{ scale: 1.05 }}
                className="
            cursor-pointer 
            text-zinc-200
            dark:text-zinc-400 
            grid place-items-center
            min-w-full min-h-full
                "
                onClick={() => {
                  handleAdd()
                }}
              >
                <span>Add Tokens</span>
              </motion.div>
            ) : (
              <motion.div
                variants={parentV}
                initial="initial"
                animate="show"
                exit="exit"
                className="
                text-xs
                md:text-base
                items-stretch
                justify-between
                min-h-full
                flex min-w-full"
              >
                <motion.button
                  variants={leftV}
                  transition={{ type: 'spring', damping: 15 }}
                  onClick={() => {
                    handleMath(true)
                  }}
                  className="
                  grid place-items-center
                min-h-full
                w-1/3
                thisEffect"
                >
                  <HiMinus />
                </motion.button>
                <motion.input
                  variants={numV}
                  transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                  ref={thisInputRef}
                  type="number"
                  className="          
              font-bold
              text-zinc-200 dark:text-zinc-400
              grow
            text-center
            outline-none
            appearance-none     
            bg-sky-500
            dark:bg-sky-800
            max-w-[25%]
            "
                  placeholder="Amount of Tokens"
                  defaultValue={1}
                  min={0}
                  onChange={e => setTokenAmount(BigNumber.from(e.target.value))}
                />
                <motion.button
                  transition={{ type: 'spring', damping: 15 }}
                  variants={rightV}
                  onClick={() => {
                    handleMath()
                  }}
                  className="
                grid place-items-center
                min-h-full
                w-1/3
                thisEffect
                "
                >
                  <HiPlus />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence exitBeforeEnter>
          {tokenAmount.toNumber() !== 0 ? (
            <motion.button
              variants={mintToken}
              initial="initial"
              animate="show"
              exit="exit"
              transition={{ type: 'spring', damping: 40 }}
              className={`
              mr-5
              thisButton 
            ${!tokenAmount.gt(0) ? 'cursor-not-allowed' : ''}
        `}
              onClick={() => mintCryptoToken(tokenAmount)}
            >
              Mint Tokens
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>
    )
  }
  return (
    <div
      className="
      overflow-hidden
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
      <section
        className="
        p-[5vmin]
        rounded-2xl
        thisNeo
        min-h-[55vmin]
        grow
        gap-5
        flex flex-col"
      >
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
              className="
              grow
              min-w-full
              flex 
              items-start justify-start
              gap-5
              flex-col "
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
              <BiPlug /> <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </section>
      <section
        className="
        rounded-xl
        p-5
        relative
        grid place-items-center
        dark:brightness-90
        min-w-[50vmin]"
      >
        <motion.p
          style={{ aspectRatio: '1' }}
          className={`
          transition-all ease duration-700 delay-500

          ${!imageLoaded ? 'opacity-100  ' : 'opacity-0 '}
                rounded-full
                animate-spin
                border-4 border-zinc-600 border-l-zinc-50
              h-[7vmin] absolute
          `}
        />
        <div className="min-w-full overflow-hidden">
          <Image
            className={`
          transition-all ease-out-sine duration-1000 delay-1000
          ${
            imageLoaded
              ? 'opacity-100 blur-0 translate-y-0'
              : ' translate-y-full opacity-0 blur-md'
          }
          `}
            onLoad={() => {
              setImageLoaded(true)
            }}
            layout="responsive"
            objectFit="contain"
            alt="header"
            height={100}
            width={100}
            src={'/cryptodev.svg'}
          />
        </div>
      </section>
    </div>
  )
}

export default Home
