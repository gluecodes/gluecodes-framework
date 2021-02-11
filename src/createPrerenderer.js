const selfClosingTags = ['br', 'img', 'hr', 'input', 'source']

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
      } else if (!/^on[A-Z]/.test(propName) && propName !== 'ref') {
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

export default () => (name, props, ...children) => stringifyNode(name, props || {}, flattenChildren(children))
