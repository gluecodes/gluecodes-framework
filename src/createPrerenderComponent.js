export default ({ glueDomPrerenderer }) => (
  module,
  {
    globalStyles,
    styleOverrides
  },
  props
) => {
  for (const className of Object.keys(styleOverrides)) {
    if (!module.customizableClasses.includes(className)) {
      throw new TypeError(`Class .${className} isn't declared as customizable`)
    }
  }

  module.setGlueDomPrerenderer(glueDomPrerenderer)

  return module.prerender({
    ...props,
    _inject: {
      externalStyles: globalStyles.others,
      fa: globalStyles.fa,
      styleOverrides
    },
    _onStateChanged: () => {}
  }).t
}
