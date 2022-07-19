import { keysToCamel } from '../../../utils'

const getCategories = async (req, res) => {
  const { domain, siteId, clientId, token } = req.query
  const fetchUrl = `
    https://${domain.replace('https://', '')}/s/${siteId}/dw/shop/v20_4/categories/root?levels=4`
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

export default getCategories
