import React, { useEffect, useState } from 'react'
import { useCMS } from '../cms'
import { flatten } from '../utils'
import { useOcapi } from './useOcapi'

export default function useCategorySelector() {
  const [selectedSiteId, setSelectedSiteId] = useState()
  const [categories, setCategories] = useState()
  const [savedValue, setSavedValue] = useState()
  const cms = useCMS()
  const installationParams = cms?.params?.installation || {}
  const { apiHost, clientId, siteIds = [], includeHiddenCategories = false } = installationParams

  const { getCategories } = useOcapi({ domain: apiHost, clientId, siteId: selectedSiteId })

  useEffect(() => {
    // pull in the saved value, if any
    ;(async () => {
      const fieldVal = await cms.field.getValue()
      if (fieldVal?.id) {
        setSavedValue(fieldVal)
        onSelectSiteId(fieldVal.siteId)
      }
    })()
  }, [])

  useEffect(() => {
    // if there's only one siteId, pre-select it
    if (siteIds?.length === 1) {
      onSelectSiteId(siteIds[0])
    } else if (!siteIds?.length) {
      throw new Error(
        'No site IDs provided - Please add an array of one or more site IDs to the extension installation parameters'
      )
    }
  }, [siteIds])

  const onSelectSiteId = async (siteId) => {
    setSelectedSiteId(siteId)
    setCategories(null)
    if (siteId) {
      // fetch categories
      const rootCategory = await getCategories(siteId, includeHiddenCategories)
      const flattenedCategories = flatten(rootCategory, 'categories')
      setCategories(flattenedCategories)
    }
  }

  const onSelectCategory = async (categoryId) => {
    if (categoryId) {
      const category = categories[categoryId]
      if (category) {
        await cms.field.setValue({ name: category?.name, id: categoryId, siteId: selectedSiteId })
      }
    } else {
      // resetValue is not working for some reason
      await cms.field.setValue(null)
    }
  }

  return { selectedSiteId, onSelectSiteId, siteIds, categories, onSelectCategory, savedValue }
}
