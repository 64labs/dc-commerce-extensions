import { useEffect, useState } from 'react'
import { Box, Flex, Stack, Text } from '@chakra-ui/react'
import { useCMS } from '../../cms'

export default function CategoryInfo() {
  const cms = useCMS()
  const [content, setContent] = useState()

  useEffect(() => {
    ;(async () => {
      setContent(await cms.contentItem.getCurrent())
    })()
  }, [])

  if (!content?.body?.categoryInfo?.json) {
    return null
  }

  const info = content.body.categoryInfo.json

  return (
    <Box paddingLeft="3px">
      <Stack>
        <Row label="ID" value={info.id} />
        <Row label="Name" value={info.name} />
        <Row label="Parent ID" value={info.parentCategoryId} />

        <Flex alignItems="baseline">
          <Text width="150px" flexShrink="0" fontSize="12px" color="gray.500" fontWeight="medium">
            Crumb Trail
          </Text>

          <Stack direction="row" spacing="1">
            {info.parentCategoryTree?.map((item, i) => {
              return (
                <Text fontSize="12px" color="gray.600" key={item.id + i}>
                  {i > 0 ? '> ' : ''}
                  {item.name}
                </Text>
              )
            })}
          </Stack>
        </Flex>
      </Stack>
    </Box>
  )
}

const Row = ({ label, value }) => {
  return (
    <Flex key={`group-field-${label}`} alignItems="baseline">
      <Text width="150px" flexShrink="0" fontSize="12px" color="gray.500" fontWeight="medium">
        {label}
      </Text>

      <Text fontSize="12px" color="gray.600">
        {value}
      </Text>
    </Flex>
  )
}
