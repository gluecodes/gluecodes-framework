const rewriteProps = props => Object.keys(props || {}).reduce((acc, propName) => ({
  ...acc,
  ...(propName === 'attrs' ? { attrs: undefined, ...props[propName] } : {})
}), props)

export default hyperScript => (tagName, props, ...children) => {
  if (props && props.attributes && props.attributes['gc-as'] === 'widget') {
    return children
  }

  return hyperScript(tagName, rewriteProps(props), children)
}
