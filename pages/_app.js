import { useEffect, useState } from 'react'
import { ChakraProvider, Flex } from '@chakra-ui/react'
import { SDK, SDKProvider } from '../sdk'
import { CMSProvider } from '../cms'

const sdkConfig = {
  proxyPath: `https://dc-commerce-extensions.vercel.app/product-selector/api/proxy`,
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
    ;(async () => {
      const extSDK = await import('dc-extensions-sdk')
      const cms = await extSDK.init()
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
          <Flex direction="column" py={6}>
            <Component {...pageProps} />
          </Flex>
        </ChakraProvider>
      </SDKProvider>
    </CMSProvider>
  )
}

export default MyApp
