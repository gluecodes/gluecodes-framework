export default ({ glueDomRenderer }) => (
  module,
  {
    globalStyles,
    styleOverrides
  }
) => {
  const externalStyles = new Proxy({}, {
    get: (target, className) => (
      Object.keys(globalStyles.others).reduce((acc, moduleName) => {
        if (globalStyles.others[moduleName][className]) {
          acc.push(globalStyles.others[moduleName][className])
        }
        return acc
      }, []).join(' ')
    )
  })

  for (const className of Object.keys(styleOverrides)) {
    if (!module.customizableClasses.includes(className)) {
      throw new TypeError(`Class .${className} isn't declared as customizable`)
    }
  }

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
    _inject: {
      externalStyles,
      fa: globalStyles.fa,
      styleOverrides
    }
  })
}
