import https from 'https'
import { createProxyMiddleware } from 'http-proxy-middleware'

const allowCors = (fn) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  return await fn(req, res)
}

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

const proxy = createProxyMiddleware({
  target: `https://cvwcejn4.api.commercecloud.salesforce.com`,
  changeOrigin: true,
  pathRewrite: {
    '^/api/proxy': '',
  },
  secure: false,
  agent: httpsAgent,
  prependPath: true,
})

export default allowCors(async (req, res) => {
  return proxy(req, res)
})

export const config = {
  api: {
    bodyParser: false,
  },
}
