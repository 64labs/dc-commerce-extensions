import { useEffect, useState } from 'react'
import {
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
  InputRightElement,
  Progress,
  Stack,
  Text,
  Wrap,
  Badge,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  CloseButton,
} from '@chakra-ui/react'
import { SearchIcon, SmallAddIcon } from '@chakra-ui/icons'
import { useSDK } from '../../sdk'
import { useCMS } from '../../cms'

export default function ProductSelector() {
  const sdk = useSDK()
  const cms = useCMS()

  const [state, setState] = useState({
    loading: false,
    searchTerm: '',
    results: null,
    selections: [],
    productsById: {},
  })

  const [mouseOverItem, setMouseOverItem] = useState()
  const [showSearch, setShowSearch] = useState(false)

  const mergeState = (data) => {
    setState((state) => ({ ...state, ...data }))
  }

  const toggleActionsOverlay = (productId) => {
    setMouseOverItem((itemId) => (itemId === productId ? undefined : productId))
  }

  const addProductSelection = async (_item) => {
    const item = {
      id: _item.productId,
      name: _item.productName,
      price: _item.price,
      image: _item.image,
      color: _item.variationAttributes.find((varAttr) => varAttr.id === 'color')?.values[0],
    }
    const updatedSelections = [...state.selections, { ...item, id: item.id }]
    setState((_state) => ({ ..._state, selections: updatedSelections }))
    updateFieldValue(updatedSelections)

    const product = await sdk.shopperProducts.getProduct({ parameters: { id: item.id, allImages: true } })
    setState((_state) => ({ ..._state, productsById: { ..._state.productsById, [product.id]: product } }))
  }

  const removeProductSelection = async (itemIndex) => {
    const updatedSelections = [...state.selections.slice(0, itemIndex), ...state.selections.slice(itemIndex + 1)]
    setState((_state) => ({ ..._state, selections: updatedSelections }))
    updateFieldValue(updatedSelections)
  }

  const setSelectionImage = (itemIndex, imageIndex, image) => {
    const selectedItem = { ...state.selections[itemIndex] }
    selectedItem.image = image
    selectedItem.selectedImageIndex = imageIndex
    const updatedSelections = [
      ...state.selections.slice(0, itemIndex),
      selectedItem,
      ...state.selections.slice(itemIndex + 1),
    ]
    setState((_state) => ({ ..._state, selections: updatedSelections }))
    updateFieldValue(updatedSelections)
  }

  const setSelectionColor = (itemIndex, color) => {
    const selectedItem = { ...state.selections[itemIndex] }
    selectedItem.color = color
    const updatedSelections = [
      ...state.selections.slice(0, itemIndex),
      selectedItem,
      ...state.selections.slice(itemIndex + 1),
    ]
    setState((_state) => ({ ..._state, selections: updatedSelections }))
    updateFieldValue(updatedSelections)
  }

  const updateFieldValue = async (selections) => {
    try {
      await cms.field.setValue(selections)
    } catch (err) {
      console.log(err.message)
    }
  }

  const handleSearchInput = (e) => {
    mergeState({ searchTerm: e.target.value })
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    try {
      mergeState({ loading: true, results: null })
      const results = await sdk.shopperSearch.productSearch({
        parameters: { limit: 25, offset: 0, q: state.searchTerm },
      })
      mergeState({ results })
    } catch (error) {
      console.log(error)
    } finally {
      mergeState({ loading: false })
    }
  }

  useEffect(() => {
    ;(async () => {
      try {
        const selections = (await cms.field.getValue()) || []
        mergeState({ selections })

        const { data } = await sdk.shopperProducts.getProducts({
          parameters: { ids: selections.map((item) => item.id).join(','), allImages: true },
        })
        mergeState({
          productsById:
            data?.reduce((acc, product) => {
              return { ...acc, [product.id]: product }
            }, {}) || {},
        })
      } catch (err) {
        console.log(err.message)
      }
    })()
  }, [])

  return (
    <Container maxW="container.md">
      <Stack spacing={6}>
        {!showSearch && (
          <Stack spacing={6}>
            <Stack spacing={4}>
              <Box flex={1}>
                <Text fontWeight="medium">{state.selections.length} Products Selected</Text>
              </Box>

              <Accordion allowMultiple>
                <Stack>
                  {state.selections.map((item, itemIndex) => {
                    const product = state.productsById[item.id]

                    const colorAttributeValues = product?.variationAttributes.find((varAttr) => varAttr.id === 'color')
                      .values

                    const productSwatches = product?.imageGroups.filter(
                      (group) => group.viewType === 'swatch' && group.variationAttributes
                    )

                    const productImages = product?.imageGroups.filter(
                      (group) => group.viewType === 'hi-res' && group.variationAttributes
                    )

                    const selectedVariant = product?.variants.find(
                      (variant) => variant.productId === item.representedProduct?.id
                    )

                    const selectedColorValue = item.color?.value || selectedVariant?.variationValues.color

                    const productImagesForSelectedColor =
                      productImages?.find(
                        (group) => group.variationAttributes[0]?.values[0].value === selectedColorValue
                      )?.images || []

                    const getSwatch = (value) => {
                      const group = productSwatches?.find(
                        (group) => group.variationAttributes[0]?.values[0].value === value
                      )
                      return (
                        <Image src={group?.images[0]?.disBaseLink} boxSize={8} objectFit="cover" borderRadius="full" />
                      )
                    }

                    return (
                      <AccordionItem
                        bg="white"
                        opacity={product ? 1 : 0.4}
                        key={`selection-${item.id}-${itemIndex}`}
                        border={0}
                      >
                        {({ isExpanded }) => (
                          <Box
                            borderTop="1px solid"
                            borderTopColor="gray.300"
                            borderBottom="1px solid"
                            borderBottomColor="gray.300"
                            borderRight="1px solid"
                            borderRightColor="gray.300"
                            borderLeft="4px solid"
                            borderLeftColor={isExpanded ? 'blue.500' : 'gray.300'}
                          >
                            <AccordionButton
                              as="div"
                              textAlign="left"
                              px={4}
                              py={2}
                              cursor="pointer"
                              _hover={{ bg: 'transparent' }}
                              _focus={{ outline: 'none' }}
                            >
                              <Flex w="full" alignItems="center">
                                <AspectRatio ratio={1.178} w="120px">
                                  <Image
                                    src={`${(item.selectedImage || item.image).disBaseLink}?sw=250`}
                                    ignoreFallback={true}
                                  />
                                </AspectRatio>

                                <Box ml={6} flex={1}>
                                  <Text fontSize="sm" fontWeight="medium">
                                    {item.name}
                                  </Text>
                                  <Text fontSize="sm" color="gray.500">
                                    Product ID: {item.id}
                                  </Text>
                                </Box>

                                <Button variant="link" size="xs" onClick={() => removeProductSelection(itemIndex)}>
                                  Remove
                                </Button>
                              </Flex>
                            </AccordionButton>

                            <AccordionPanel pb={4} borderTop="1px solid" borderColor="gray.100">
                              <Stack spacing={6} pt={3} divider={<Divider />}>
                                <Stack>
                                  <Text fontSize="sm" fontWeight="medium">
                                    Colors
                                  </Text>
                                  <Wrap>
                                    {colorAttributeValues?.map((val) => {
                                      return (
                                        <Box
                                          key={val.value}
                                          p="2px"
                                          borderRadius="full"
                                          border="2px solid"
                                          borderColor={selectedColorValue === val.value ? 'blue.500' : 'gray.200'}
                                          onClick={() => setSelectionColor(itemIndex, val)}
                                        >
                                          {getSwatch(val.value)}
                                        </Box>
                                      )
                                    })}
                                  </Wrap>
                                </Stack>

                                <Stack>
                                  <Text fontSize="sm" fontWeight="medium">
                                    Images
                                  </Text>
                                  <Wrap>
                                    {productImagesForSelectedColor?.map((image, imageIndex) => {
                                      return (
                                        <Box
                                          key={`${image.disBaseLink}-imageIndex`}
                                          border="2px solid"
                                          borderColor={
                                            item.image?.disBaseLink === image.disBaseLink ? 'blue.500' : 'transparent'
                                          }
                                          onClick={() => setSelectionImage(itemIndex, imageIndex, image)}
                                        >
                                          <AspectRatio ratio={1.178} w="120px">
                                            <Image
                                              src={`${image.disBaseLink}?sw=250`}
                                              objectFit="cover"
                                              borderRadius="full"
                                              ignoreFallback={true}
                                            />
                                          </AspectRatio>
                                        </Box>
                                      )
                                    })}
                                  </Wrap>
                                </Stack>
                              </Stack>
                            </AccordionPanel>
                          </Box>
                        )}
                      </AccordionItem>
                    )
                  })}
                </Stack>
              </Accordion>
            </Stack>
            <Box>
              <Button colorScheme="blue" size="sm" onClick={() => setShowSearch(true)}>
                Add Products
              </Button>
            </Box>
          </Stack>
        )}

        {showSearch && (
          <Stack spacing={2}>
            <Flex alignItems="center" justifyContent="space-between">
              <Text fontWeight="medium">Add Products</Text>
              <CloseButton onClick={() => setShowSearch(false)} />
            </Flex>

            <Stack spacing={6}>
              <Box as="form" position="relative" onSubmit={handleSearch}>
                <InputGroup alignItems="center">
                  <Input
                    size="lg"
                    placeholder="Search"
                    onChange={handleSearchInput}
                    value={state.searchTerm}
                    borderRadius={0}
                    borderWidth="2px"
                    borderColor="gray.300"
                  />
                  <InputRightElement
                    h="full"
                    pointerEvents="none"
                    children={<SearchIcon boxSize={5} color="gray.500" />}
                  />
                </InputGroup>

                {state.loading && (
                  <Box position="absolute" w="full" bottom="-8px">
                    <Progress size="xs" isIndeterminate />
                  </Box>
                )}
              </Box>

              {state.results && (
                <Stack opacity={state.loading ? 0.5 : 1}>
                  <Text fontSize="sm">Showing 1 - 25 of {state.results.total}</Text>
                  <Stack>
                    {state.results?.hits?.map((hit) => {
                      const selectedCount = state.selections.filter((item) => item.id === hit.productId).length

                      return (
                        <Flex
                          key={hit.productId}
                          position="relative"
                          px={4}
                          py={2}
                          alignItems="center"
                          border="1px solid"
                          borderColor="gray.300"
                          onMouseEnter={() => toggleActionsOverlay(hit.productId)}
                          onMouseLeave={() => toggleActionsOverlay(hit.productId)}
                        >
                          <AspectRatio ratio={1.178} w="120px">
                            <Image src={`${hit.image.disBaseLink}?sw=250`} ignoreFallback={true} />
                          </AspectRatio>

                          <Flex ml={6} flex={1} w="full" alignItems="center">
                            <Box flex={1}>
                              <Text fontSize="sm" fontWeight="medium">
                                {hit.productName}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                Product ID:{hit.productId}
                              </Text>
                            </Box>

                            {selectedCount > 0 && (
                              <Badge variant="solid" colorScheme="green" borderRadius="full" boxSize={6}>
                                <Center boxSize="full">{selectedCount}</Center>
                              </Badge>
                            )}
                          </Flex>

                          {mouseOverItem === hit.productId && (
                            <Center position="absolute" top="0" right="0" bottom="0" left="0" bg="rgba(0, 0, 0, 0.5)">
                              <IconButton
                                icon={<SmallAddIcon boxSize={8} />}
                                size="lg"
                                borderRadius="full"
                                onClick={() => addProductSelection(hit)}
                              />
                            </Center>
                          )}
                        </Flex>
                      )
                    })}
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Container>
  )
}
