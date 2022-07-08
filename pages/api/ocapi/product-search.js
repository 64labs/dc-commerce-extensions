import { keysToCamel } from '../../../utils'

const productSearch = async (req, res) => {
  const { domain, siteId, clientId, token, searchTerm } = req.query
  const fetchUrl = `https://${domain}/s/${siteId}/dw/shop/v20_4/product_search?q=${encodeURIComponent(
    searchTerm
  )}&limit=25&offset=0&start=0&expand=images`
  const response = await fetch(fetchUrl, {
    headers: {
      authorization: token,
      'x-dw-client-id': clientId,
    },
  })
  const json = await response.json()
  const transformedResponse = keysToCamel(json)
  res.json(transformedResponse)
}

export default productSearch
