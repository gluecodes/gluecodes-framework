export default ({
  bootstrap,
  fontAwesome
}) => (module, { styles, roleName, scopeName }, props) => {
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

  module.setExternalStyles(externalStyles)
  module.setFontAwesome(fontAwesome)

  const html = module.prerender(props).trim()

  let scopedHtml = html.replace(/^(<[^<>]+)(class="[^"]*)/, `$1$2 gc-role-${scopeName}-${roleName}`)

  if (scopedHtml === html) {
    scopedHtml = html.replace(/^(<[^<>]+)/, `$1 class="gc-role-${scopeName}-${roleName}"`)
  }

  return scopedHtml
}
