import { useEffect, useState } from 'react'
import {
  Image,
  Box,
  Button,
  Center,
  Stack,
  Text,
  Select,
  Flex,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  IconButton,
} from '@chakra-ui/react'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { useCMS } from '../../../cms'

export default function ImagePicker() {
  const cms = useCMS()
  const [state, setState] = useState({ images: [] })

  const { title } = cms.params.instance

  const addNewImage = async () => {
    const image = await cms.mediaLink.getImage()
    setState((current) => ({ images: current.images.concat({ image, data: {} }) }))
  }

  const setSize = (value, index) => {
    setState((current) => {
      const images = [...current.images]
      images[index].data = { ...images[index].data, screen: value }
      return { images }
    })
  }

  const setAltText = (value, index) => {
    setState((current) => {
      const images = [...current.images]
      images[index].data = { ...images[index].data, altText: value }
      return { images }
    })
  }

  const changeImage = async (index) => {
    const image = await cms.mediaLink.getImage()
    setState((current) => {
      const images = [...current.images]
      images[index].image = image
      return { images }
    })
  }

  const deleteImage = async (index) => {
    setState((current) => {
      const images = current.images.filter((img, i) => i !== index)
      return { images }
    })
  }

  useEffect(() => {
    ;(async () => {
      const currentValue = await cms.field.getValue()
      if (currentValue && currentValue.images) {
        setState(currentValue)
      }
    })()
  }, [])

  useEffect(() => {
    cms.field.setValue(state)
  }, [state])

  return (
    <Stack spacing={2}>
      <Text fontSize="sm">{title || 'Images'}</Text>

      <Stack spacing={4}>
        {state?.images?.map(({ data, image }, index) => {
          return (
            <Box
              key={image.id}
              position="relative"
              padding={4}
              border="1px solid"
              borderColor="gray.200"
              borderLeft="4px solid"
              borderLeftColor="blue.500"
              borderRadius="2px"
            >
              <Stack direction="row" align="center" spacing={4}>
                <Box bg="gray.100" border="1px solid" borderColor="gray.200" position="relative">
                  <Image
                    src={`https://${image.defaultHost}/i/${image.endpoint}/${image.name}`}
                    boxSize="150px"
                    objectFit="contain"
                  />
                  <Center
                    position="absolute"
                    top={0}
                    right={0}
                    bottom={0}
                    left={0}
                    background="rgba(0,0,0,0.5)"
                    opacity={0}
                    cursor="pointer"
                    _hover={{ opacity: 1 }}
                    onClick={() => changeImage(index)}
                  >
                    <IconButton
                      aria-label="delete"
                      icon={<EditIcon boxSize={6} />}
                      variant="unstyled"
                      color="black"
                      boxSize="60px"
                      borderRadius="100%"
                      background="gray.100"
                    />
                  </Center>
                </Box>
                <Stack flex={1} align="flex-start">
                  <Box
                    as="pre"
                    bg="gray.100"
                    paddingX="8px"
                    paddingY="2px"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="1px"
                  >
                    <Text as="code" fontSize="sm" color="red.400">
                      {image.name}
                    </Text>
                  </Box>

                  <Box>
                    <Select
                      placeholder="Select screen size"
                      size="sm"
                      borderRadius="none"
                      value={state.images[index].data?.screen || ''}
                      onChange={(e) => setSize(e.target.value, index)}
                    >
                      <option value="mobile">Mobile</option>
                      <option value="tablet">Tablet</option>
                      <option value="desktop">Desktop</option>
                    </Select>
                  </Box>

                  <Box height="12px" />

                  <Box minWidth="300px">
                    <FormControl>
                      <FormLabel htmlFor="email" fontSize="xs" marginBottom={1} marginLeft="2px">
                        Alt Text
                      </FormLabel>
                      <Input
                        id="alttext"
                        size="sm"
                        borderRadius="none"
                        value={state.images[index].data?.altText || ''}
                        onChange={(e) => setAltText(e.target.value, index)}
                      />
                    </FormControl>
                  </Box>
                </Stack>
              </Stack>

              <Box position="absolute" right={2} top={2}>
                <IconButton
                  aria-label="delete"
                  icon={<DeleteIcon />}
                  variant="ghost"
                  color="gray.500"
                  onClick={() => deleteImage(index)}
                />
              </Box>
            </Box>
          )
        })}

        <Box />
      </Stack>

      <Box>
        <Button size="sm" colorScheme="blue" onClick={() => addNewImage()}>
          Add Image
        </Button>
      </Box>
    </Stack>
  )
}
