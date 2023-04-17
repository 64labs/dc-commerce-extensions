import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { ChakraProvider, Flex, extendTheme } from '@chakra-ui/react'
import { SDK, SDKProvider } from '../sdk'
import { CMSProvider } from '../cms'

const theme = extendTheme({
  styles: {
    global: {
      'html, body': { height: '100%' },
      '#__next': { height: '100%' },
    },
  },
})

function MyApp({ Component, pageProps }) {
  const { query, pathname, isReady } = useRouter()
  const [cms, setCMS] = useState()

  const useDevCMSExt = query.dev === 'true'

  const sdkConfig = {
    proxyPath:
      process.env.NODE_ENV === 'development'
        ? `http://localhost:3000/api/proxy`
        : `https://dc-commerce-extensions.vercel.app/api/proxy`,
    parameters: {
      clientId: 'a0ef1339-b861-417a-be6b-b8111704417d',
      organizationId: 'f_ecom_bhhq_dev',
      shortCode: '0xbgcdsq',
      siteId: '64labs',
    },
  }

  const sdk = new SDK(sdkConfig)

  useEffect(() => {
    /** @todo - this is smelly, but fine for now */
    if (pathname === '/product-selector' && !query?.productPickerUrl) {
      sdk.login()
    }

    if (useDevCMSExt && isReady) {
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
        cms.frame?.startAutoResizer()
        setCMS(cms)
      })()
    }
  }, [isReady, useDevCMSExt])

  if (!cms) {
    return null
  }

  return (
    <CMSProvider value={cms}>
      <SDKProvider value={sdk}>
        <ChakraProvider theme={theme}>
          <Flex direction="column" height="100%">
            <Component {...pageProps} />
          </Flex>
        </ChakraProvider>
      </SDKProvider>
    </CMSProvider>
  )
}

export default MyApp
