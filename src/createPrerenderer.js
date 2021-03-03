const selfClosingTags = [
  'area',
  'base',
  'basefont',
  'bgsound',
  'br',
  'col',
  'command',
  'embed',
  'frame',
  'hr',
  'image',
  'img',
  'input',
  'isindex',
  'keygen',
  'link',
  'menuitem',
  'meta',
  'nextid',
  'param',
  'source',
  'track',
  'wbr'
]

function flattenChildren (htmlChunks) {
  return htmlChunks.map((child) => {
    let transformedChild = child

    if (Array.isArray(child)) {
      transformedChild = flattenChildren(child).join('')
    }

    return transformedChild
  })
}

const camelcaseToDashed = string => string.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)

const styleObjectToString = (styleObject) => {
  if (typeof styleObject === 'string') {
    return styleObject
  }

  return Object.keys(styleObject)
    .map(propName => `${camelcaseToDashed(propName)}:${styleObject[propName]}`)
    .join(';')
}

const stringifyNode = (name, props, children) => {
  if (name === 'Show') { // @todo add more of the flow control tags
    if (props.when) {
      return children
    }

    return ''
  }

  if (name === 'For') {
    return props.each.map((item, index) => children[0](item, () => index))
  }

  if (name === 'Dynamic') {
    return props.component(props)
  }

  const attrs = Object.keys(props)
    .reduce((acc, propName) => {
      if (propName === 'className') {
        acc.push(`class="${props[propName]}"`)
      } else if (propName === 'attributes') {
        Object.keys(props[propName]).forEach((attrName) => {
          acc.push(`${attrName}="${props[propName][attrName]}"`)
        })
      } else if (propName === 'style') {
        acc.push(`${propName}="${styleObjectToString(props[propName])}"`)
      } else if (typeof props[propName] === 'boolean') {
        if (props[propName]) {
          acc.push(propName)
        }
      } else if (!/^on[A-Z]/.test(propName) && !['ref'].includes(propName) && typeof props[propName] !== 'undefined') {
        acc.push(`${propName}="${props[propName]}"`)
      }

      return acc
    }, [])
    .join(' ')

  if (selfClosingTags.includes(name)) {
    return `<${name}${attrs ? ` ${attrs}` : ''}/>`
  }

  return `<${name}${attrs ? ` ${attrs}` : ''}>${children.join('')}</${name}>`
}

export default () => (name, props, ...children) => {
  if (typeof name === 'function') {
    return name(props || {})
  }

  if (name === 'fragment') {
    return children
  }

  return stringifyNode(name, props || {}, flattenChildren(children))
}
