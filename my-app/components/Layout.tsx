import { FC, ReactNode } from 'react'
import ThemeSwitch from './ThemeSwitch'
import Head from 'next/head'

interface layoutProps {
  children: ReactNode
}
const Layout:FC<layoutProps> = ({ children }) => {
  return (
    <main
      className="
      text-zinc-700
      dark:text-zinc-400
      bg-zinc-300
      dark:bg-zinc-900
      flex flex-col 
      items-center justify-center
      min-h-screen 
      min-w-full"
    >
      <Head>
        <title>CryptoDev ICO </title>
        <meta
          name="description"
          content="Crypto Dev Token COntract - LearnWeb3 DAO"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section
        className="
        p-5
        min-w-full
        flex justify-end"
      >
        <ThemeSwitch />
      </section>

      <section
        className="
        grow
        flex flex-col items-center justify-center
        min-w-full
        "
      >
        {children}
      </section>
    </main>
  )
}

export default Layout
