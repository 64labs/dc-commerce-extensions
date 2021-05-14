import { createContext, useContext } from 'react'
import jwtDecode from 'jwt-decode'

export const SDKContext = createContext()
export const SDKProvider = SDKContext.Provider
export const useSDK = () => useContext(SDKContext)

/**
 * Compares the token age against the issued and expiry times. If the token's age is
 * within 60 seconds of its valid time (or exceeds it), we consider the token invalid.
 * @function
 * @param {string} token - The JWT bearer token to be inspected
 * @returns {boolean}
 */
export function isTokenValid(token) {
  if (!token) {
    return false
  }
  const { exp, iat } = jwtDecode(token.replace('Bearer ', ''))
  const validTimeSeconds = exp - iat - 60
  const tokenAgeSeconds = Date.now() / 1000 - iat
  if (validTimeSeconds > tokenAgeSeconds) {
    return true
  }

  return false
}

/**
 * Indicates if an JSON response from the SDK should be considered an error
 * @param {object} jsonResponse - The response object returned from SDK calls
 * @returns {boolean}
 */
export const isError = (jsonResponse) => {
  if (!jsonResponse) {
    return false
  }

  const { detail, title, type } = jsonResponse
  if (detail && title && type) {
    return true
  }

  return false
}
