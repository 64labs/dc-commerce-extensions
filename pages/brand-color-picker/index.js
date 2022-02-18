import { useEffect, useState } from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  AspectRatio,
  Box,
  Button,
  IconButton,
  Center,
  Container,
  Flex,
  Image,
  Input,
  InputGroup,
  Progress,
  Stack,
  Text,
  Badge,
  InputLeftElement,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { SearchIcon, SmallAddIcon } from '@chakra-ui/icons'
import { ContentClient } from 'dc-delivery-sdk-js'
import { useCMS } from '../../cms'

const client = new ContentClient({
  hubName: 'rsa',
})

export default function ProductSelector() {
  const cms = useCMS()
  const [state, setState] = useState({
    selectedColor: null,
    colorOptionsContent: null,
  })

  const { title, contentID, groups } = cms.params.instance

  const mergeState = (data) => {
    setState((state) => ({ ...state, ...data }))
  }

  const handleColorSelection = async (color) => {
    mergeState({ selectedColor: color })
    await cms.field.setValue(color)
  }

  useEffect(() => {
    ;(async () => {
      const currentValue = await cms.field.getValue()
      const { body } = await client.getContentItemById(contentID)
      mergeState({ selectedColor: currentValue, colorOptionsContent: body })
    })()
  }, [])

  return (
    <Box>
      <Stack>
        {title && <Text fontSize="sm">{title}</Text>}

        <Stack direction="row" align="center" spacing={4}>
          <Box
            padding="2px"
            border={state.selectedColor ? '2px solid' : '2px dashed'}
            borderColor={state.selectedColor ? 'gray.500' : 'gray.200'}
            boxSize={14}
          >
            <Box background={state.selectedColor?.color} boxSize="full" />
          </Box>
          <Text>{state.selectedColor?.name}</Text>
        </Stack>
      </Stack>

      <Box height={5} />

      <Accordion allowMultiple allowToggle>
        <AccordionItem>
          <AccordionButton paddingX={0} _focus={{ outline: 'none' }}>
            <AccordionIcon />
            <Box width="4px" />
            <Box>
              <Text fontSize="xs" color="gray.600">
                Color Options
              </Text>
            </Box>
          </AccordionButton>
          <AccordionPanel>
            <Stack spacing={6}>
              {state.colorOptionsContent?.groups
                .filter((group) => !Array.isArray(groups) || groups.includes(group.id))
                .map((group) => {
                  return (
                    <Stack>
                      <Text fontSize="xs" color="gray.900" fontWeight={500}>
                        {group.name}
                      </Text>

                      <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(150px, 1fr));" gridGap={3}>
                        {group.colors?.map((color) => {
                          return (
                            <Button
                              display="block"
                              variant="unstyled"
                              align="flex-start"
                              justifyContent="flex-start"
                              _focus={{ outline: 'none' }}
                              onClick={() => handleColorSelection(color)}
                              height="auto"
                              width="150px"
                              borderRadius={0}
                            >
                              <Stack direction="row" align="center" justify="flex-start">
                                <Box
                                  border="1px solid"
                                  borderColor={color.color === state.selectedColor?.color ? 'blue.500' : 'gray.300'}
                                  boxSize={10}
                                  padding="1px"
                                >
                                  <Box boxSize="full" background={color.color}></Box>
                                </Box>
                                <Text fontSize="xs" whiteSpace="normal" lineHeight="16px" align="left" fontWeight={300}>
                                  {color.name}
                                </Text>
                              </Stack>
                            </Button>
                          )
                        })}
                      </Box>
                    </Stack>
                  )
                })}
            </Stack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  )
}
