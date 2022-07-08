const authTokenRequest = async (req, res) => {
  const { domain, siteId, clientId } = req.query
  const fetchUrl = `https://${domain}/s/${siteId}/dw/shop/v20_4/customers/auth`
  const response = await fetch(fetchUrl, {
    method: 'POST',
    headers: {
      'x-dw-client-id': clientId,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ type: 'guest' }),
  })
  const authHeader = response.headers.get('authorization')
  //   const json = await response.json()
  res.json({ token: authHeader })
}

export default authTokenRequest
