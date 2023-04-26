import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  Input,
  Select,
  Stack,
  Text,
} from '@chakra-ui/react'
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons'
import { useCMS } from '../../cms'

const CardHeading = ({ children }) => {
  return (
    <>
      <Box padding="15px">
        <Heading fontWeight="normal" fontSize="18px">
          {children}
        </Heading>
      </Box>
      <Divider />
    </>
  )
}

const Card = ({ children }) => {
  return (
    <Box h="full" bg="white">
      {children}
    </Box>
  )
}

const CacheInvalidation = () => {
  const cms = useCMS()

  const [chosenTarget, setChosenTarget] = useState()
  const [chosenPath, setChosenPath] = useState('')
  const [status, setStatus] = useState('idle')

  const params = cms?.params?.installation || {}
  const targets = params.mrtTargets

  useEffect(() => {
    setStatus('idle')
  }, [chosenPath, chosenTarget])

  const createInvalidation = async () => {
    setStatus('loading')

    const result = await fetch(`/api/mrt/target/${chosenTarget}/invalidation`, {
      method: 'post',
      body: JSON.stringify({ pattern: chosenPath }),
    }).then((r) => r.json())

    if (result.result) {
      setStatus('success')
      setTimeout(() => {
        setStatus('idle')
      }, 5000)
    } else {
      setStatus('error')
    }
  }

  return (
    <Card>
      <CardHeading>SSR Cache Invalidation</CardHeading>

      <Box padding="20px 30px">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            createInvalidation()
          }}
        >
          <Stack spacing="5">
            <Text fontSize="sm">
              Use this to invalidate the server-side-rendered (SSR) cache of a specific URL path or pattern. Only
              trailing * will work. For example, "/elf-discovery/*" to clear all the pages in elf discovery.
            </Text>

            <Stack>
              <Select placeholder="Select project target" required onChange={(e) => setChosenTarget(e.target.value)}>
                {targets?.map((target) => (
                  <option key={target} value={target}>
                    {target}
                  </option>
                ))}
              </Select>

              <Input
                type="text"
                placeholder="Enter URL path to invalidate (eg. /best-sellers)"
                value={chosenPath}
                onChange={(e) => setChosenPath(e.target.value)}
                pattern="/.*"
                required
              />
            </Stack>
            <Flex align="center" gap={4}>
              <Button colorScheme="blue" type="submit" isLoading={status === 'loading'}>
                Create Invalidation
              </Button>

              <Flex align="center" gap={2}>
                {status === 'success' && (
                  <>
                    <CheckCircleIcon color="green" />
                    <Text fontSize="xs" color="gray.600">
                      Invalidation is in progress.
                    </Text>
                  </>
                )}
                {status === 'error' && (
                  <>
                    <WarningIcon color="red" />
                    <Text fontSize="xs" color="gray.600">
                      Something went wrong. Try again or contact support.
                    </Text>
                  </>
                )}
              </Flex>
            </Flex>
          </Stack>
        </form>
      </Box>
    </Card>
  )
}

const MenuRoutingInvalidation = () => {
  const cms = useCMS()
  const [chosenTarget, setChosenTarget] = useState()
  const [status, setStatus] = useState('idle')

  const params = cms?.params?.installation || {}
  const targets = params.mrtTargets
  const paths = params.menuRoutePaths

  useEffect(() => {
    setStatus('idle')
  }, [chosenTarget])

  const createInvalidation = async () => {
    setStatus('loading')

    await Promise.all(
      paths.map((path) =>
        fetch(`/api/mrt/target/${chosenTarget}/invalidation`, {
          method: 'post',
          body: JSON.stringify({ pattern: path }),
        }).then((r) => r.json())
      )
    )

    setStatus('success')
    setTimeout(() => {
      setStatus('idle')
    }, 5000)
  }

  return (
    <Card>
      <CardHeading>Menu / Routing Cache Invalidation</CardHeading>

      <Box padding="20px 30px">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            createInvalidation()
          }}
        >
          <Stack spacing="5">
            <Text fontSize="sm">
              For performance reasons we cache the menu and routes as a file in MRT to be used by the site in the
              server-side-rendering of pages. Use this to invalidate the cached menu and route file.
            </Text>

            <Select placeholder="Select project target" required onChange={(e) => setChosenTarget(e.target.value)}>
              {targets?.map((target) => (
                <option key={target} value={target}>
                  {target}
                </option>
              ))}
            </Select>

            <Flex align="center" gap={4}>
              <Button colorScheme="blue" type="submit" isLoading={status === 'loading'}>
                Create Invalidation
              </Button>

              <Flex align="center" gap={2}>
                {status === 'success' && (
                  <>
                    <CheckCircleIcon color="green" />
                    <Text fontSize="xs" color="gray.600">
                      Invalidation is in progress.
                    </Text>
                  </>
                )}
                {status === 'error' && (
                  <>
                    <WarningIcon color="red" />
                    <Text fontSize="xs" color="gray.600">
                      Something went wrong. Try again or contact support.
                    </Text>
                  </>
                )}
              </Flex>
            </Flex>
          </Stack>
        </form>
      </Box>
    </Card>
  )
}

const Faq = () => {
  return (
    <Card>
      <CardHeading>Frequently Asked Questions</CardHeading>

      <Box padding="20px 15px">
        <Stack>
          <Heading fontSize="sm">What is MRT and why would I use this?</Heading>
          <Text fontSize="sm">Managed runtime is the front-end hosting provided by Salesforce...</Text>
        </Stack>
      </Box>
    </Card>
  )
}

export default function MRTDashboard() {
  return (
    <Box bg="#f2f2f2" height="100%">
      <Container maxW="1320px" paddingY="40px" paddingX="30px">
        <Grid templateColumns="repeat(2, 1fr)" gap={8}>
          <GridItem>
            <CacheInvalidation />
          </GridItem>

          <GridItem>
            <MenuRoutingInvalidation />
          </GridItem>

          <GridItem colSpan={2}>
            <Faq />
          </GridItem>
        </Grid>
      </Container>
    </Box>
  )
}
