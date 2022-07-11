import { useCallback, useEffect, useState } from 'react'
import { nanoid } from 'nanoid'
import update from 'immutability-helper'
import { useSDK } from '../sdk'
import { useCMS } from '../cms'

export default function ProductSelector(productPickerUrl = null) {
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
      color: _item?.variationAttributes?.find?.((varAttr) => varAttr.id === 'color')?.values[0],
    }
    const updatedSelections = [...state.selections, { ...item, id: item.id }]
    setState((_state) => ({ ..._state, selections: updatedSelections }))
    updateFieldValue(updatedSelections)

    let product
    if (productPickerUrl) {
      const getProductResults = await fetch(
        `${productPickerUrl}/api/product-picker/shopperProducts/getProduct?id=${item.id}&allImages=true`
      )
      product = await getProductResults.json()
    } else {
      product = await sdk.shopperProducts.getProduct({ parameters: { id: item.id, allImages: true } })
    }
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
      let results
      if (productPickerUrl) {
        const productSearchResults = await fetch(
          `${productPickerUrl}/api/product-picker/shopperSearch/productSearch?q=${state.searchTerm}`
        )
        results = await productSearchResults.json()
      } else {
        results = await sdk.shopperSearch.productSearch({
          parameters: { limit: 25, offset: 0, q: state.searchTerm },
        })
      }
      mergeState({ results })
    } catch (error) {
      console.log(error)
    } finally {
      mergeState({ loading: false })
    }
  }

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

  useEffect(() => {
    ;(async () => {
      try {
        const selections = (await cms.field.getValue()) || []
        mergeState({ selections })

        let data
        const ids = selections.map((item) => item.id).join(',')

        if (productPickerUrl) {
          const getProductsResults = await fetch(
            `${productPickerUrl}/api/product-picker/shopperProducts/getProducts?ids=(${ids})&allImages=true`
          )
          data = await getProductsResults.json()?.data
        } else {
          data = await sdk.shopperProducts.getProducts({
            parameters: { ids, allImages: true },
          })?.data
        }

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

  return {
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
  }
}
