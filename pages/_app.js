import { useEffect, useState } from 'react'
import { ChakraProvider, Flex } from '@chakra-ui/react'
import { SDK, SDKProvider } from '../sdk'
import { CMSProvider } from '../cms'

const isDev = process.env.NODE_ENV === 'development'

const sdkConfig = {
  proxyPath: isDev ? `http://localhost:3000/api/proxy` : 'https://dc-commerce-extensions.vercel.app/api/proxy',
  parameters: {
    clientId: 'e4289502-7960-4387-b48a-a030e447800e',
    organizationId: 'f_ecom_bbsz_stg',
    shortCode: 'cvwcejn4',
    siteId: 'shoecarnival',
  },
}

const sdk = new SDK(sdkConfig)

function MyApp({ Component, pageProps }) {
  const [cms, setCMS] = useState()

  useEffect(() => {
    sdk.login()

    if (isDev) {
      setCMS({
        field: {
          async getValue() {
            return []
          },
          async setValue() {
            return undefined
          },
        },
      })
      return
    }

    ;(async () => {
      const extSDK = await import('dc-extensions-sdk')
      const cms = await extSDK.init()
      cms.frame.startAutoResizer()
      setCMS(cms)
    })()
  }, [])

  if (!cms) {
    return null
  }

  return (
    <CMSProvider value={cms}>
      <SDKProvider value={sdk}>
        <ChakraProvider>
          <Flex direction="column">
            <Component {...pageProps} />
          </Flex>
        </ChakraProvider>
      </SDKProvider>
    </CMSProvider>
  )
}

export default MyApp
