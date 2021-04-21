export default ({ glueDomPrerenderer }) => (
  module,
  {
    globalStyles,
    styleOverrides
  },
  props
) => {
  const externalStyles = {}

  for (const className of Object.keys(styleOverrides)) {
    if (!module.customizableClasses.includes(className)) {
      throw new TypeError(`Class .${className} isn't declared as customizable`)
    }
  }

  module.setGlueDomPrerenderer(glueDomPrerenderer)

  if (globalStyles.others) {
    Object.keys(globalStyles.others).forEach((moduleName) => {
      Object.keys(globalStyles.others[moduleName]).forEach((className) => {
        externalStyles[className] = externalStyles[className] ? `${externalStyles[className]} ${globalStyles.others[moduleName][className]}` : externalStyles[className]
      })
    })
  }

  return module.prerender({
    ...props,
    _inject: {
      externalStyles,
      fa: globalStyles.fa,
      styleOverrides
    }
  }).t
}
