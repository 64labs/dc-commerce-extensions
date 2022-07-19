// OCAPI response transformation utils
const toCamel = (str) => {
  if (str.startsWith('_') || str.startsWith('c_')) {
    return str
  }
  return str.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace('-', '').replace('_', '')
  })
}

const isObject = (obj) => {
  return obj === Object(obj) && !Array.isArray(obj) && typeof obj !== 'function'
}

export const keysToCamel = (obj) => {
  if (isObject(obj)) {
    const n = {}

    Object.keys(obj).forEach((k) => {
      n[toCamel(k)] = keysToCamel(obj[k])
    })

    return n
  } else if (Array.isArray(obj)) {
    return obj.map((i) => {
      return keysToCamel(i)
    })
  }

  return obj
}

/**
 * Flattens a tree data structure into an array.
 * @param {*} node
 * @returns
 */
export const flatten = (node, key = 'children') => {
  const children = (node[key] || []).reduce((a, b) => {
    return Array.isArray(b[key]) && !!b[key].length ? { ...a, ...flatten(b, key) } : { ...a, [b.id]: b }
  }, {})

  return {
    [node.id]: node,
    ...children,
  }
}
