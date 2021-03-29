const filterAttrs = attrs => Object.keys(attrs).reduce((acc, attrName) => {
  if (!/^gc-/.test(attrName) ||
    (attrName === 'gc-as' && attrs[attrName] === 'slot') || (attrName === 'gc-name' && attrs['gc-as'] === 'slot') ||
    (attrName === 'gc-as' && attrs[attrName] === 'widget') || (attrName === 'gc-name' && attrs['gc-as'] === 'widget') || (attrName === 'gc-role' && attrs['gc-as'] === 'widget')) {
    acc[attrName] = attrs[attrName]
  }

  return acc
}, {})

const rewriteProps = props => Object.keys(props || {}).reduce((acc, propName) => ({
  ...acc,
  ...(propName === 'attrs' ? { attrs: undefined, ...filterAttrs(props[propName]) } : {})
}), props)

export default hyperScript => (tagName, props, ...children) => {
  if (props && props.attributes && props.attributes['gc-as'] === 'widget') {
    return children
  }

  const anyReactiveChildren = children.some(node => typeof node === 'function')

  if (anyReactiveChildren) {
    return hyperScript(tagName, rewriteProps(props), () => children)
  }

  return hyperScript(tagName, rewriteProps(props), ...children)
}
