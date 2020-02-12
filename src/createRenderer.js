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

const rewriteProps = (props) => Object.keys(props || {}).reduce((acc, propName) => ({
  ...acc,
  ...(propName === 'gc-onDomNodeConnected'
    ? { 'gc-onDomNodeConnected': onDomNodeConnected(props[propName]) }
    : {}),
  ...(propName === 'gc-onceDomNodeVisited'
    ? { 'gc-onceDomNodeVisited': onceDomNodeVisited(props[propName]) }
    : {})
}), props)

export default () => (tagName, props, ...args) => h(tagName, rewriteProps(props), args)
