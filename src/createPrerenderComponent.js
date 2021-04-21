export default ({ glueDomPrerenderer }) => (
  module,
  {
    globalStyles,
    styleOverrides
  },
  props
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

  module.setGlueDomPrerenderer(glueDomPrerenderer)

  return module.prerender({
    ...props,
    _inject: {
      externalStyles,
      fa: globalStyles.fa,
      styleOverrides
    }
  }).t
}
