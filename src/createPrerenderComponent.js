export default () => (
  module,
  {
    componentId,
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
      throw new TypeError(`Class .${className} of ${scopeName}-${roleName}.component.css isn't declared as customizable`)
    }

    externalStyles[className] = [
      ...(externalStyles[className] ? externalStyles[className].split(' ') : []),
      componentClassMap[className]
    ].join(' ')
  }

  const html = module.prerender({
    ...props,
    _inject: {
      externalStyles,
      fa
    }
  }).trim()

  let scopedHtml = html.replace(/^(<[^<>]+)(class="[^"]*)/, `$1$2 gc-role-${componentId}`)

  if (scopedHtml === html) {
    scopedHtml = html.replace(/^(<[^<>]+)/, `$1 class="gc-role-${componentId}"`)
  }

  return scopedHtml
}
