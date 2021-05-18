import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { ChakraProvider, Flex } from '@chakra-ui/react'
import { SDK, SDKProvider } from '../sdk'
import { CMSProvider } from '../cms'

function MyApp({ Component, pageProps }) {
  const { query, isReady } = useRouter()
  const [cms, setCMS] = useState()

  const isDev = process.env.NODE_ENV === 'development' || query.dev === 'true'

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

  useEffect(() => {
    sdk.login()

    if (isDev && isReady) {
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

    if (isReady) {
      ;(async () => {
        const extSDK = await import('dc-extensions-sdk')
        const cms = await extSDK.init()
        cms.frame.startAutoResizer()
        setCMS(cms)
      })()
    }
  }, [isReady, isDev])

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
