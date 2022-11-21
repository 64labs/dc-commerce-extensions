import React from 'react'
import { ChevronLeftIcon } from '@chakra-ui/icons'
import { Box, Button, Center, Container, HStack, Spinner, Stack, Text } from '@chakra-ui/react'
import useCategorySelector from '../../hooks/useCategorySelector'
import { CUIAutoComplete } from '../../components/autocomplete'

export default function CategorySelector() {
  const { categories, selectedSiteId, onSelectSiteId, onSelectCategory, siteIds, savedValue } = useCategorySelector()
  return (
    <Box height="335px">
      {selectedSiteId && siteIds?.length > 1 && (
        <Button
          width="fit-content"
          height="fit-content"
          variant="ghost"
          _hover={{ textDecoration: 'underline' }}
          onClick={() => onSelectSiteId(null)}
        >
          <HStack spacing="0.5">
            <ChevronLeftIcon w={5} h={5} />
            <Text fontSize="sm">Change site</Text>
          </HStack>
        </Button>
      )}
      <Container maxW="container.md" paddingY="1">
        {!selectedSiteId ? (
          <Stack align="center">
            <Text>Select which site's categories you want to view</Text>
            <HStack spacing="8px">
              {siteIds.map((id) => (
                <Button
                  key={id}
                  backgroundColor="#e5e5e5"
                  borderRadius="3px"
                  height="30px"
                  fontSize="14px"
                  _hover={{
                    backgroundColor: '#039be5',
                    color: 'white',
                  }}
                  onClick={() => onSelectSiteId(id)}
                >
                  {id}
                </Button>
              ))}
            </HStack>
          </Stack>
        ) : (
          <Stack spacing={0}>
            <Text align="center" fontSize="14px">
              Selected Site:{' '}
              <Text as="span" fontWeight="bold">
                {selectedSiteId}
              </Text>
            </Text>
            {categories ? (
              <CUIAutoComplete
                listStyleProps={{ maxHeight: '175px', overflowY: 'auto' }}
                onSelectedItemChange={(selectedCategoryId) => {
                  onSelectCategory(selectedCategoryId)
                }}
                // only use the saved value if we're on the same siteId it was saved on. The category might not exist on other sites
                savedValue={savedValue && selectedSiteId === savedValue?.siteId ? savedValue : undefined}
                placeholder="Type a category"
                items={Object.keys(categories).map((categoryId) => ({
                  label: `${categories[categoryId].name} (${categoryId})`,
                  value: categoryId,
                }))}
                inputStyleProps={{
                  border: 0,
                  borderRadius: 0,
                  padding: 0,
                  borderBottom: '1px solid black',
                  fontSize: '13px',
                  height: '26px',
                  _focus: { borderBottom: '2px solid rgb(3,155,229)' },
                  boxSizing: 'content-box',
                }}
              />
            ) : (
              <Center>
                <Spinner />
              </Center>
            )}
          </Stack>
        )}
      </Container>
    </Box>
  )
}
