import { useEffect } from 'react'
import { ChakraProvider, Box, Flex } from '@chakra-ui/react'
import { SDK, SDKProvider } from '../sdk'

const sdkConfig = {
  proxyPath: `http://localhost:3000/api/proxy`,
  parameters: {
    clientId: 'e4289502-7960-4387-b48a-a030e447800e',
    organizationId: 'f_ecom_bbsz_stg',
    shortCode: 'cvwcejn4',
    siteId: 'shoecarnival',
  },
}

const sdk = new SDK(sdkConfig)

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    sdk.login()
  }, [])

  return (
    <SDKProvider value={sdk}>
      <ChakraProvider>
        <Flex direction="column" py={6}>
          <Component {...pageProps} />
        </Flex>
      </ChakraProvider>
    </SDKProvider>
  )
}

export default MyApp
