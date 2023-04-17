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

export default function MRTDashboard() {
  const [targets, setTargets] = useState([])
  const [chosenTarget, setChosenTarget] = useState()
  const [chosenPath, setChosenPath] = useState('')
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    getTargets()
  }, [])

  useEffect(() => {
    setStatus('idle')
  }, [chosenPath, chosenTarget])

  const getTargets = () => {
    fetch('/api/mrt/target')
      .then((r) => r.json())
      .then((r) => setTargets(r.results))
  }

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
    <Box bg="#f2f2f2" height="100%">
      <Container maxW="1320px" paddingY="40px" paddingX="30px">
        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <GridItem bg="white">
            <Box padding="15px">
              <Heading fontWeight="normal" fontSize="18px">
                Cache Invalidation
              </Heading>
            </Box>
            <Divider />

            <form
              onSubmit={(e) => {
                e.preventDefault()
                createInvalidation()
              }}
            >
              <Stack spacing="5" padding="30px">
                <Stack>
                  <Select
                    placeholder="Select project target"
                    size="sm"
                    required
                    onChange={(e) => setChosenTarget(e.target.value)}
                  >
                    {targets?.map((target) => (
                      <option key={target.slug} value={target.slug}>
                        {target.name}
                      </option>
                    ))}
                  </Select>

                  <Input
                    type="text"
                    size="sm"
                    placeholder="Enter URL path to invalidate (eg. /best-sellers)"
                    value={chosenPath}
                    onChange={(e) => setChosenPath(e.target.value)}
                    pattern="/.*"
                    required
                  />
                </Stack>
                <Flex align="center" gap={4}>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    type="submit"
                    isLoading={status === 'loading'}
                    // onClick={createInvalidation}
                    // disabled={!chosenPath || !chosenTarget}
                  >
                    Create Invalidation
                  </Button>

                  <Flex align="center" gap={2}>
                    {status === 'success' && (
                      <>
                        <CheckCircleIcon color="green" />
                        <Text fontSize="xs" color="gray.600">
                          Invalidation is progress
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
          </GridItem>
        </Grid>
      </Container>
    </Box>
  )
}
