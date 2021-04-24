export default ({ glueDomPrerenderer }) => (
  module,
  {
    globalStyles,
    styleOverrides
  },
  props
) => {
  const unimportedClassNameProxy = new Proxy({}, {
    get: (target, prop) => {
      if (typeof prop === 'string' && prop !== '__proto__') {
        return `unimported_${prop}`
      }

      return null
    }
  })

  const externalStylesProxy = new Proxy({}, {
    get: (target, className) => {
      if (!globalStyles.others) {
        return unimportedClassNameProxy[className]
      }

      return Object.keys(globalStyles.others).reduce((acc, moduleName) => {
        if (globalStyles.others[moduleName][className]) {
          acc.push(globalStyles.others[moduleName][className])
        }

        return acc
      }, []).join(' ')
    }
  })

  const styleOverridesProxy = new Proxy({}, {
    get: (target, className) => {
      if (!globalStyles.others) {
        return styleOverrides[className]
      }

      return Object.keys(globalStyles.others).reduce((acc, moduleName) => {
        if (moduleName !== 'bootstrap' && globalStyles.others[moduleName][className]) {
          acc.push(globalStyles.others[moduleName][className])
        }
        return acc
      }, [styleOverrides[className]]).join(' ')
    }
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
      externalStyles: externalStylesProxy,
      fa: globalStyles.fa,
      styleOverrides: styleOverridesProxy
    }
  }).t
}
