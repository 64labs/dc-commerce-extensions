import { useEffect, useState } from 'react'
import { Box, Button, Image, Stack, Text } from '@chakra-ui/react'
import { ContentClient } from 'dc-delivery-sdk-js'
import { useCMS } from '../../cms'

const client = new ContentClient({
  hubName: 'rsa',
})

export default function ProductSelector() {
  const cms = useCMS()
  const [state, setState] = useState({
    selection: null,
    options: [],
  })

  const { title, contentType, contentID } = cms.params.instance

  const mergeState = (data) => {
    setState((state) => ({ ...state, ...data }))
  }

  const handleSelection = async (selection) => {
    mergeState({ selection })
    await cms.field.setValue(selection)
  }

  useEffect(() => {
    ;(async () => {
      const currentValue = await cms.field.getValue()
      const { body } = await client.getContentItemById(contentID)

      mergeState({
        selection: currentValue,
        options: body.component.find((c) => c.contentType === contentType)?.options,
      })
    })()
  }, [])

  return (
    <Box>
      <Stack>
        {title && <Text fontSize="sm">{title}</Text>}

        <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(200px, 1fr))" gridGap={1}>
          {state.options?.map(({ image, value }) => {
            return (
              <Button
                variant="unstyled"
                onClick={() => handleSelection(value)}
                boxSize="200px"
                border="2px solid"
                borderColor={state.selection === value ? 'blue.500' : 'gray.200'}
                _focus={{ outline: 'none' }}
                borderRadius={0}
              >
                <Image src={`https://${image.defaultHost}/i/${image.endpoint}/${image.name}`} />
              </Button>
            )
          })}
        </Box>
      </Stack>
    </Box>
  )
}
