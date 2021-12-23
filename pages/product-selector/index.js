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
  Progress,
  Stack,
  Text,
  Badge,
  Accordion,
  InputLeftElement,
} from '@chakra-ui/react'
import { SearchIcon, SmallAddIcon } from '@chakra-ui/icons'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import useProductSelector from '../../hooks/useProductSelector'
import ProductItem from '../../components/product-item'

export default function ProductSelector() {
  const {
    state,
    moveCard,
    addProductSelection,
    removeProductSelection,
    setSelectionImage,
    setSelectionColor,
    handleSearch,
    handleSearchInput,
    mouseOverItem,
    showSearch,
    setShowSearch,
    toggleActionsOverlay,
  } = useProductSelector()

  return (
    <DndProvider backend={HTML5Backend}>
      <Container maxW="container.md">
        <Stack spacing={6}>
          {!showSearch && (
            <Stack spacing={6} p={4} bg="gray.50" border="1px solid" borderColor="gray.200">
              <Stack spacing={4}>
                <Flex direction="row" align="center" justify="space-between">
                  <Text fontWeight="medium">{state.selections.length} Products Selected</Text>
                  <Flex>
                    <Button size="sm" colorScheme="blue" onClick={() => setShowSearch(true)}>
                      Add Products
                    </Button>
                  </Flex>
                </Flex>

                {state.selections.length > 0 && (
                  <Accordion allowMultiple>
                    <Stack>
                      {state.selections.map((item, itemIndex) => (
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
                      ))}
                    </Stack>
                  </Accordion>
                )}
              </Stack>

              {/* <Box>
                <Button colorScheme="blue" size="sm" onClick={() => setShowSearch(true)}>
                  Add Products
                </Button>
              </Box> */}
            </Stack>
          )}

          {showSearch && (
            <Stack spacing={4}>
              <Stack spacing={4} position="sticky" top="0" bg="white" zIndex={2}>
                <Flex
                  direction="row"
                  align="center"
                  justify="space-between"
                  p={4}
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <Text fontWeight="medium">{state.selections.length} Products Selected</Text>

                  <Flex>
                    <Button size="sm" variant="outline" onClick={() => setShowSearch(false)}>
                      Done
                    </Button>
                  </Flex>

                  {/* <Wrap>
                    {state.selections.map((item) => (
                      <AspectRatio ratio={1.178} w="80px">
                        <Image
                          src={`${item.image.disBaseLink}?sw=250`}
                          borderRadius="2px"
                          border="1px solid"
                          borderColor="gray.100"
                          ignoreFallback={true}
                        />
                      </AspectRatio>
                    ))}
                  </Wrap> */}
                </Flex>

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
                      pl="44px"
                    />
                    <InputLeftElement
                      h="full"
                      ml={1}
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
              </Stack>

              <Stack spacing={6} minHeight="250px">
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
                            py={1}
                            alignItems="center"
                            border="1px solid"
                            borderColor="gray.300"
                            onMouseEnter={() => toggleActionsOverlay(hit.productId)}
                            onMouseLeave={() => toggleActionsOverlay(hit.productId)}
                          >
                            <AspectRatio ratio={1.178} w="100px">
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
