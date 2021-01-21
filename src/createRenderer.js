import h from 'virtual-dom/h'

const onDomNodeConnected = (handler) => {
  const Hook = function Hook () {}

  Hook.prototype.hook = node => setTimeout(() => {
    if (!node.isConnected) { return }
    handler(node)
  }, 0)

  return new Hook()
}

const onceDomNodeVisited = (handler) => {
  const Hook = function Hook () {}

  Hook.prototype.hook = node => setTimeout(() => {
    if (!node.isConnected || node._gc_hasDomNodeBeenVisited) { return }
    node._gc_hasDomNodeBeenVisited = true
    handler(node)
  }, 0)

  return new Hook()
}

const rewriteProps = (tagName, props) => Object.keys(props || {}).reduce((acc, propName) => ({
  ...acc,
  ...(propName === 'gc-onDomNodeConnected'
    ? { 'gc-onDomNodeConnected': onDomNodeConnected(props[propName]) }
    : {}),
  ...(propName === 'gc-onceDomNodeVisited'
    ? { 'gc-onceDomNodeVisited': onceDomNodeVisited(props[propName]) }
    : {}),
  ...(tagName === 'source' && propName === 'src'
    ? {
      'gc-onDomNodeConnected': onDomNodeConnected((node) => {
        if (/^blob:/.test(node.src)) {
          node.parentNode.load()
        }
      })
    } : {})
}), props)

export default () => (tagName, props, ...children) => {
  if (props && props.attributes && props.attributes['gc-as'] === 'widget') {
    return children
  }

  return h(tagName, rewriteProps(tagName, props), children)
}
