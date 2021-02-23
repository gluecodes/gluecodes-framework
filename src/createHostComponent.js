export default ({
  createRenderingSignal,
  glueDomRenderer,
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
    createRenderingSignal,
    externalStyles,
    fa
  }

  for (const className of Object.keys(componentClassMap)) {
    if (!module.customizableClasses.includes(className)) {
      throw new TypeError(`Class .${className} isn't declared as customizable`)
    }

    externalStyles[className] = [
      ...(externalStyles[className] ? externalStyles[className].split(' ') : []),
      componentClassMap[className]
    ].join(' ')
  }

  module.setRenderer(renderer)
  module.setGlueDomRenderer(glueDomRenderer)

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

  return props => module.render({
    ...props,
    _inject: injectables
  })
}
