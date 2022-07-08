import { keysToCamel } from '../../../utils'

const getProducts = async (req, res) => {
  const { domain, siteId, clientId, token, ids } = req.query
  const fetchUrl = `https://${domain}/s/${siteId}/dw/shop/v20_4/products/${ids}?expand=options,images,prices,variations,availability,promotions,links&all_images=true`
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

export default getProducts
