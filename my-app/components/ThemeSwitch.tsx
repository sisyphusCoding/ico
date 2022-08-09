import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { BsSunFill, BsMoonFill } from 'react-icons/bs'

const ThemeSwitch = (): JSX.Element => {
  const [dark, setDark] = useState<boolean>(false)

  const [isOn,setIsOn] = useState<boolean>(false)
  useEffect(() => {
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme:dark)').matches)
    ) {
      setDark(true)
    }
  }, [])

  useEffect(()=>{
    //avoid to much motion , after button is triggered 
    setIsOn(false)
  },[dark])

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.theme = 'dark'
    } else if (!dark) {
      document.documentElement.classList.remove('dark')
      localStorage.theme = 'light'
    }
  }, [dark])

  return (
    <motion.section
      onClick={() => {
        setDark(!dark)
      }}
      animate={{ rotateX: dark ? 180 : 0 }}
      transition={{type:'spring',damping:25,stiffness:100}}
      style={{
        transformStyle: 'preserve-3d'
      }}

      onMouseEnter={()=>{setIsOn(true)}}      
      onMouseLeave={()=>{setIsOn(false)}}

      className="
      border-transparent border-[.35vmin]
      cursor-pointer
      h-[5vmin]
      w-[6.5vmin] 
      rounded-lg md:rounded-xl
      bg-zinc-100 dark:bg-zinc-500
      text-zinc-500 dark:text-zinc-800
      text-[3vmin]
      flex flex-col items-center justify-center relative
      "
    >
      <div 
        style={{
          transform: `perspective(100rem) rotateY(0) rotateZ(${isOn? 360/2:0}deg)  translate3d(0,0,.8rem)`
        }}
        className="
        absolute min-h-full flex items-center 
        transition-all ease duration-1000
       "
      >
        <BsSunFill />
      </div>

      <div

        style={{
          transform: `perspective(100rem) rotateX(180deg) rotateZ(${isOn? 360*2:0}deg)  translate3d(0,0,.8rem)`
        }}

        className="
        absolute min-h-full flex items-center 
        transition-all ease duration-1000
       "
      >
        <BsMoonFill />
      </div>
    </motion.section>
  )
}

export default ThemeSwitch
