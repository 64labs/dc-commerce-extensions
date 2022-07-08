import { useEffect, useState } from 'react'

export const useOcapi = ({ domain, siteId, clientId }) => {
  const [authToken, setAuthToken] = useState()
  useEffect(() => {
    getAuthToken()
  }, [])
  const getAuthToken = async () => {
    const fetchUrl = `/api/ocapi/auth?clientId=${clientId}&siteId=${siteId}&domain=${domain}`
    const response = await fetch(fetchUrl)
    const json = await response.json()
    setAuthToken(json?.token)
  }
  const getProducts = async (ids = '') => {
    const fetchUrl = `/api/ocapi/get-products?clientId=${clientId}&siteId=${siteId}&domain=${domain}&token=${authToken}&ids=${ids}`
    const response = await fetch(fetchUrl)
    const json = await response.json()
    return json
  }
  const productSearch = async (searchTerm = '') => {
    const fetchUrl = `/api/ocapi/product-search?clientId=${clientId}&siteId=${siteId}&domain=${domain}&searchTerm=${searchTerm}&token=${authToken}`
    const response = await fetch(fetchUrl)
    const json = await response.json()
    return json
  }
  return {
    getProducts,
    productSearch,
  }
}
