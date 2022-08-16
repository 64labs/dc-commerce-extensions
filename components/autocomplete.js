import * as React from 'react'
import { useCombobox } from 'downshift'
import { matchSorter } from 'match-sorter'
import Highlighter from 'react-highlight-words'
import useDeepCompareEffect from 'react-use/lib/useDeepCompareEffect'
import { FormLabel } from '@chakra-ui/form-control'
import { Stack, Box, List, ListItem, ListIcon } from '@chakra-ui/layout'
import { Button } from '@chakra-ui/button'
import { Input, InputGroup, InputRightElement } from '@chakra-ui/input'
import { CheckCircleIcon, TriangleDownIcon } from '@chakra-ui/icons'

function defaultOptionFilterFunc(items, inputValue) {
  return matchSorter(items, inputValue, { keys: ['value', 'label'] })
}

export const CUIAutoComplete = (props) => {
  const {
    items,
    optionFilterFunc = defaultOptionFilterFunc,
    highlightItemBg = 'gray.100',
    placeholder,
    label,
    listStyleProps,
    labelStyleProps,
    inputStyleProps,
    toggleButtonStyleProps,
    selectedIconProps,
    listItemStyleProps,
    icon,
    onSelectedItemChange,
    savedValue,
  } = props

  const [isInitialRender, setIsInitialRender] = React.useState(true)
  const [inputValue, setInputValue] = React.useState(savedValue?.label || '')
  const [inputItems, setInputItems] = React.useState(items)

  const disclosureRef = React.useRef(null)

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
    openMenu,
    closeMenu,
    selectItem,
    selectedItem,
  } = useCombobox({
    inputValue,
    selectedItem,
    items: inputItems,
    onInputValueChange: ({ inputValue, selectedItem }) => {
      const filteredItems = optionFilterFunc(items, inputValue || '')
      if (isInitialRender) {
        setIsInitialRender(false)
      } else {
        setInputItems(filteredItems)
      }
    },
    stateReducer: (state, actionAndChanges) => {
      const { changes, type } = actionAndChanges
      switch (type) {
        case useCombobox.stateChangeTypes.InputBlur:
          if (selectedItem) {
            setInputValue(selectedItem.label)
          }
          return {
            ...changes,
            isOpen: false,
          }
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          return {
            ...changes,
            highlightedIndex: state.highlightedIndex,
            inputValue,
            isOpen: true,
          }
        case useCombobox.stateChangeTypes.FunctionSelectItem:
          return {
            ...changes,
            inputValue,
          }
        default:
          return changes
      }
    },
    onStateChange: ({ inputValue, type, selectedItem }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputChange:
          setInputValue(inputValue || '')
          break
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          if (selectedItem) {
            selectItem(selectedItem)
          }
          break
        default:
          break
      }
    },
    onSelectedItemChange: ({ selectedItem: newSelectedItem }) => {
      if (newSelectedItem) {
        onSelectedItemChange(newSelectedItem.value)
        setInputValue(newSelectedItem?.label)
        closeMenu()
      } else {
        setIsInitialRender(true)
        onSelectedItemChange(null)
        setInputValue('')
        setInputItems(items)
        closeMenu()
      }
    },
  })

  React.useEffect(() => {
    if (savedValue) {
      selectItem({ label: `${savedValue?.name} (${savedValue?.id})`, value: savedValue?.id })
    }
  }, [])

  useDeepCompareEffect(() => {
    setInputItems(items)
  }, [items])

  return (
    <Stack>
      <FormLabel {...{ ...getLabelProps({}), ...labelStyleProps }}>{label}</FormLabel>
      <Stack isInline {...getComboboxProps()}>
        <>
          <InputGroup>
            <Input
              {...inputStyleProps}
              {...getInputProps({
                onClick: isOpen ? () => {} : openMenu,
                onFocus: isOpen ? () => {} : openMenu,
                ref: disclosureRef,
                placeholder,
              })}
            />
            {selectedItem && (
              <InputRightElement
                justifyContent="flex-end"
                children={
                  <Box marginRight={1} marginBottom={3}>
                    <TriangleDownIcon
                      width={3}
                      height={3}
                      color="rgba(0,0,0,0.54)"
                      onClick={() => (isOpen ? closeMenu() : disclosureRef?.current?.focus?.())}
                      cursor="pointer"
                    />
                  </Box>
                }
              />
            )}
          </InputGroup>
        </>
      </Stack>
      <Box pb={4} mb={4}>
        <List
          bg="white"
          borderRadius="4px"
          border={isOpen && '1px solid rgba(0,0,0,0.1)'}
          boxShadow="6px 5px 8px rgba(0,50,30,0.02)"
          {...listStyleProps}
          {...getMenuProps()}
        >
          {isOpen &&
            inputItems.map((item, index) => (
              <ListItem
                px={2}
                py={1}
                borderBottom="1px solid rgba(0,0,0,0.01)"
                {...listItemStyleProps}
                bg={highlightedIndex === index ? highlightItemBg : 'inherit'}
                key={`${item.value}${index}`}
                {...getItemProps({ item, index })}
              >
                <Box display="inline-flex" alignItems="center">
                  {selectedItem?.value === item.value && (
                    <ListIcon
                      as={icon || CheckCircleIcon}
                      color="green.500"
                      role="img"
                      display="inline"
                      aria-label="Selected"
                      {...selectedIconProps}
                    />
                  )}

                  <Highlighter autoEscape searchWords={[inputValue || '']} textToHighlight={item.label} />
                </Box>
              </ListItem>
            ))}
        </List>
      </Box>
    </Stack>
  )
}
