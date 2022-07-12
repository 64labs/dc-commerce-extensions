import { useEffect, useRef } from 'react'
import {
  AspectRatio,
  Box,
  Button,
  Flex,
  Image,
  Stack,
  Text,
  Wrap,
  Divider,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
} from '@chakra-ui/react'
import { useDrag, useDrop } from 'react-dnd'

export default function ProductItem({
  id,
  product,
  item,
  index,
  moveCard,
  removeProductSelection,
  setSelectionImage,
  setSelectionColor,
}) {
  const ref = useRef(null)
  const [{ handlerId }, drop] = useDrop({
    accept: 'card',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      // Determine mouse position
      const clientOffset = monitor.getClientOffset()
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }
      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex)
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })
  const [{ isDragging }, drag] = useDrag({
    type: 'card',
    item: () => {
      return { id, index }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })
  const opacity = isDragging ? 0 : 1
  drag(drop(ref))

  const colorAttributeValues = product?.variationAttributes.find((varAttr) => varAttr.id === 'color').values

  let productSwatches = product?.imageGroups.filter((group) => group.viewType === 'swatch' && group.variationAttributes)

  if (!productSwatches || productSwatches.length === 0) {
    productSwatches = colorAttributeValues?.map((color) => {
      return { images: [color.imageSwatch], variationAttributes: [{ values: [{ value: color.value }] }] }
    })
  }

  const productImages = product?.imageGroups.filter((group) => group.viewType === 'large' && group.variationAttributes)

  const selectedVariant = product?.variants.find((variant) => variant.productId === item.representedProduct?.id)

  const selectedColorValue = item.color?.value || selectedVariant?.variationValues.color

  const productImagesForSelectedColor =
    productImages?.find((group) => group.variationAttributes[0]?.values[0].value === selectedColorValue)?.images || []

  const getSwatch = (value) => {
    const group = productSwatches?.find((group) => group.variationAttributes[0]?.values[0].value === value)
    return <Image src={group?.images[0]?.link} boxSize={8} objectFit="cover" borderRadius="full" />
  }

  useEffect(() => {
    if (productImagesForSelectedColor?.length > 0) {
      setSelectionImage(index, 0, productImagesForSelectedColor[0])
    }
  }, [productImagesForSelectedColor])

  return (
    <AccordionItem ref={ref} data-handler-id={handlerId} bg="white" border={0} opacity={opacity}>
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
              <AspectRatio ratio={1} w="120px">
                <Image
                  src={`${(item.selectedImage || item.image).disBaseLink}?sw=250`}
                  objectFit="contain"
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

              <Button variant="link" size="xs" onClick={() => removeProductSelection(index)}>
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
                        onClick={() => setSelectionColor(index, val)}
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
                        key={`${image?.link}-imageIndex`}
                        border="2px solid"
                        borderColor={item.image?.link === image?.link ? 'blue.500' : 'transparent'}
                        onClick={() => setSelectionImage(index, imageIndex, image)}
                      >
                        <AspectRatio ratio={1} w="120px">
                          <Image src={`${image?.disBaseLink}?sw=250`} objectFit="contain" ignoreFallback={true} />
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
}
