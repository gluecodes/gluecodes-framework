export default ({
  bootstrap,
  fontAwesome,
  renderer
}) => (module, { styles, roleName, scopeName }) => {
  const externalStyles = { ...bootstrap }
  const componentClassMap = styles

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
      _inject: {
        externalStyles,
        fa: fontAwesome
      }
    })

    if (vDomNode) {
      vDomNode.properties.className = `${vDomNode.properties.className || ''} gc-role-${scopeName}-${roleName}`.trim()
    }

    return vDomNode
  }
}
