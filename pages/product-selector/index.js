import { useCallback, useEffect, useState } from 'react'
import { nanoid } from 'nanoid'
import update from 'immutability-helper'
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
  Badge,
  Accordion,
  CloseButton,
} from '@chakra-ui/react'
import { SearchIcon, SmallAddIcon } from '@chakra-ui/icons'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useSDK } from '../../sdk'
import { useCMS } from '../../cms'
import ProductItem from '../components/product-item'

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
      guid: nanoid(),
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

  const moveCard = useCallback(
    (dragIndex, hoverIndex) => {
      const dragCard = state.selections[dragIndex]
      const updatedSelections = update(state.selections, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragCard],
        ],
      })
      setState((_state) => ({ ..._state, selections: updatedSelections }))
      updateFieldValue(updatedSelections)
    },
    [state.selections]
  )

  return (
    <DndProvider backend={HTML5Backend}>
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
                      console.log(item.guid)
                      return (
                        <ProductItem
                          key={`selection-${item.id}-${item.guid}`}
                          id={item.guid}
                          item={item}
                          product={state.productsById[item.id]}
                          index={itemIndex}
                          moveCard={moveCard}
                          removeProductSelection={removeProductSelection}
                          setSelectionImage={setSelectionImage}
                          setSelectionColor={setSelectionColor}
                        />
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

              <Stack spacing={6} minHeight="250px">
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
    </DndProvider>
  )
}
