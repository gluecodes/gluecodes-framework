export default ({
  glueDomPrerenderer,
  prerenderer
}) => (
  module,
  {
    getExternalStyles,
    styles
  },
  props
) => {
  const { fa, others } = getExternalStyles()
  const externalStyles = others
  const componentClassMap = styles

  for (const className of Object.keys(componentClassMap)) {
    if (!module.customizableClasses.includes(className)) {
      throw new TypeError(`Class .${className} isn't declared as customizable`)
    }

    externalStyles[className] = [
      ...(externalStyles[className] ? externalStyles[className].split(' ') : []),
      componentClassMap[className]
    ].join(' ')
  }

  module.setPrerenderer(prerenderer)
  module.setGlueDomPrerenderer(glueDomPrerenderer)

  return module.prerender({
    ...props,
    _inject: {
      externalStyles,
      fa
    }
  }).trim()
}
