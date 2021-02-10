import h from 'solid-js/h'

export default () => (tagName, props, ...children) => {
  if (tagName === 'fragment' || (props && props.attributes && props.attributes['gc-as'] === 'widget')) {
    return children
  }

  return h(tagName, props, children)
}
