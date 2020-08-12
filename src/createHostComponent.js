export default ({
  renderer
}) => (
  module,
  {
    componentId,
    getExternalStyles,
    styles
  }
) => {
  const { fa, others } = getExternalStyles()
  const externalStyles = others
  const componentClassMap = styles
  const injectables = {
    externalStyles,
    fa
  }

  for (const className of Object.keys(componentClassMap)) {
    if (!module.customizableClasses.includes(className)) {
      throw new TypeError(`Class .${className} of ${scopeName}-${roleName}.component.css isn't declared as customizable`)
    }

    externalStyles[className] = [
      ...(externalStyles[className] ? externalStyles[className].split(' ') : []),
      componentClassMap[className]
    ].join(' ')
  }

  module.setRenderer(renderer)

  // import fonts
  module.googleFonts.forEach((font) => {
    if (global.document.querySelector(`style[href="${font.preload}"]`)) { return }

    const preloadNode = global.document.createElement('style')
    const fontFaceNode = global.document.createElement('style')

    preloadNode.setAttribute('rel', 'preload')
    preloadNode.setAttribute('href', font.preload)
    preloadNode.setAttribute('as', 'font')
    preloadNode.setAttribute('crossorigin', '')
    preloadNode.setAttribute('async', '')
    fontFaceNode.textContent = `@font-face {${font.fontFace}}`

    global.document.head.appendChild(preloadNode)
    global.document.head.appendChild(fontFaceNode)
  })

  return (props) => {
    const vDomNode = module.default({
      ...props,
      _inject: injectables
    })

    if (typeof vDomNode === 'function' && vDomNode.constructor.name !== 'VirtualNode') {
      const thunkComponent = vDomNode

      return (...args) => {
        const vDomNode = thunkComponent(...args)

        if (vDomNode) {
          vDomNode.properties.className = `${vDomNode.properties.className || ''} gc-role-${componentId}`.trim()
        }

        return vDomNode
      }
    }

    if (vDomNode) {
      vDomNode.properties.className = `${vDomNode.properties.className || ''} gc-role-${componentId}`.trim()
    }

    return vDomNode
  }
}
