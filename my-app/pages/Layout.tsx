import { NextPage } from "next";
import { ReactNode } from "react";

interface layoutProps {
  children: ReactNode
}
const Layout:NextPage<layoutProps> = ({children}) =>{
  return(
    <main 
     className="min-h-screen min-w-full">
   
      <section>

      </section>

      <section
       className="grow"
       >
        {children}
      </section>

    </main>
  )
}
