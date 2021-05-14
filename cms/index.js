import { createContext, useContext } from 'react'

export const CMSContext = createContext()
export const CMSProvider = CMSContext.Provider
export const useCMS = () => {
  return useContext(CMSContext)
}
