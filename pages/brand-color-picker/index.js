import { useEffect, useState } from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button,
  Stack,
  Text,
} from '@chakra-ui/react'
import { ContentClient } from 'dc-delivery-sdk-js'
import { useCMS } from '../../cms'

export default function BrandColorPicker({ hubName }) {
  const cms = useCMS()
  const [state, setState] = useState({
    selectedColor: null,
    colorOptionsContent: null,
  })

  let { contentID } = cms.params.installation || {}
  // Default Color will be an  object {color:...,name: ...}
  const { title, groups, defaultColor } = cms.params.instance

  if (!contentID) {
    contentID = cms.params.instance.contentID
  }

  const mergeState = (data) => {
    setState((state) => ({ ...state, ...data }))
  }

  const handleColorSelection = async (color) => {
    mergeState({ selectedColor: color })
    await cms.field.setValue(color)
  }

  useEffect(() => {
    ;(async () => {
      const client = new ContentClient({
        hubName,
      })
      let currentValue = await cms.field.getValue()
      const { body } = await client.getContentItemById(contentID)
      // this should indicate that teh value is empty and hasn't explicitly been set to empty so set
      // it to the default value if specified
      if (!currentValue.name && defaultColor) {
        currentValue = defaultColor
      }
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
          {state.selectedColor?.color && (
            <Text
              fontSize="xs"
              color="gray.500"
              cursor={'pointer'}
              textDecoration={'underline'}
              onClick={() => handleColorSelection({ color: null, name: 'No Color Selected' })}
            >
              {' '}
              Remove Color
            </Text>
          )}
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

export async function getServerSideProps({ query }) {
  return {
    props: {
      hubName: query?.hubName || 'rsa',
    },
  }
}
