import { createState } from 'solid-js'
import { render as renderApp } from 'solid-js/web'

export default (setupProps) => {
  if (typeof setupProps.afterProviders !== 'undefined' && typeof setupProps.afterProviders !== 'function') {
    throw new TypeError('setupProps.afterProviders must be a function')
  }

  if (!setupProps.commands || setupProps.commands.constructor.name !== 'Object') {
    throw new TypeError('setupProps.commands must be an object of functions')
  }

  if (!setupProps.providers || setupProps.providers.constructor.name !== 'Object') {
    throw new TypeError('setupProps.providers must be an object of functions')
  }

  if (!setupProps.store || setupProps.store.constructor.name !== 'Object') {
    throw new TypeError('setupProps.store must be an object')
  }

  return async ({
    providers = [],
    renderPage,
    rootNode,
    slots
  } = {}) => {
    if (!Array.isArray(providers)) {
      throw new TypeError('providers must be an array')
    }

    if (typeof renderPage !== 'function') {
      throw new TypeError('renderPage must be a function')
    }

    if (!rootNode || !/^HTML\w+Element$/.test(rootNode.constructor.name)) {
      throw new TypeError('rootNode must be an instance of HTML Element')
    }

    if (!slots || slots.constructor.name !== 'Object') {
      throw new TypeError('slots must be an object of functions')
    }

    const [state, updateState] = createState({
      actionResults: {
        ...Object.keys(setupProps.commands).reduce((acc, commandName) => ({
          ...acc,
          [commandName]: undefined
        }), {}),
        ...providers.reduce((acc, providerName) => ({
          ...acc,
          [providerName]: undefined
        }), {}),
        ...setupProps.store,
        errors: {}
      }
    })

    const handleError = (error) => {
      const errors = { ...state.actionResults.errors }

      if (!errors[error.name]) {
        errors[error.name] = error
      } else {
        Object.getOwnPropertyNames(error)
          .reduce((acc, propName) => Object.assign(acc, { [propName]: error[propName] }), errors[error.name])

        errors[error.name].isCancelled = false
      }

      errors[error.name].throwCount = errors[error.name].throwCount || 0
      errors[error.name].throwCount += 1

      if (error.due) {
        Object.assign(
          errors,
          error.due.reduce((acc, error) => ({ ...acc, [error.name]: error }), {})
        )
      }

      updateState('actionResults', {
        ...state.actionResults,
        errors
      })
    }
    const nativeCommands = {
      cancelError: ({ errorName, shouldRerender = true }) => {
        const errors = { ...state.actionResults.errors }

        if (errors[errorName]) {
          errors[errorName].isCancelled = true

          if (errors[errorName].due) {
            errors[errorName].due.forEach((error) => {
              error.isCancelled = true
            })
          }
        }

        if (shouldRerender) {
          updateState('actionResults', {
            ...state.actionResults,
            errors
          })
        }
      },
      redirect (path) {
        global.window.location = `${global.window.location.origin}/${path}`
      },
      reload: async () => {
        await runProviders()
      },
      rerender: () => updateState('actionResults', { ...state.actionResults, forceRerender: (new Date().getTime()) }),
      runTogether: async (commandsToRun) => {
        try {
          const commandResults = {}

          for (const command of commandsToRun) {
            const [commandName, ...args] = command
            const commandBeingExecuted = allCommands[commandName](...args)

            if (commandBeingExecuted instanceof Promise) {
              commandResults[commandName] = await commandBeingExecuted
            } else {
              commandResults[commandName] = commandBeingExecuted
            }
          }

          updateState('actionResults', {
            ...state.actionResults,
            ...commandResults
          })
        } catch (err) {
          handleError(err)
        }
      },
      fail: handleError
    }
    const allCommands = {
      ...setupProps.commands,
      ...nativeCommands
    }
    const createSlotRenderer = () => ({ id }) => {
      if (slots[id]) {
        return hostData => slots[id]({
          actionResults: state.actionResults,
          actions: boundCommands,
          hostData
        })
      }

      return () => null
    }
    const boundCommands = Object.keys(setupProps.commands).reduce((acc, commandName) => ({
      ...acc,
      [commandName]: (...args) => {
        try {
          const commandBeingExecuted = allCommands[commandName](...args)

          if (commandBeingExecuted instanceof Promise) {
            updateState('actionResults', commandName, commandBeingExecuted)
            return commandBeingExecuted
              .then((result) => {
                updateState('actionResults', commandName, result)
              })
              .catch(handleError)
          }

          updateState('actionResults', commandName, commandBeingExecuted)
          return commandBeingExecuted
        } catch (err) {
          handleError(err)
        }
      }
    }), { ...nativeCommands })
    const incomingDataProvided = (providerName, data) => {
      liveProviderPromises.priv[providerName].resolve(data)
      updateState('actionResults', providerName, data)
    }
    const liveProviderPromises = { priv: {}, pub: {} }
    const initializedLiveProviders = []
    const runProviders = async () => {
      for (const providerName of providers) {
        const providerBeingExecuted = setupProps.providers[providerName](state.actionResults)

        if (providerBeingExecuted instanceof Promise) {
          updateState('actionResults', providerName, await providerBeingExecuted)
        } else if (typeof providerBeingExecuted === 'function') {
          liveProviderPromises.pub[providerName] = new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(new Error(`Provider: '${providerName}' didn't resolve within 20s, make sure all its preceding providers exist in the provider pipeline`))
            }, 20000)
            liveProviderPromises.priv[providerName] = { resolve }
          })
          providerBeingExecuted({
            asyncResults: liveProviderPromises.pub,
            hasBeenInitialized: initializedLiveProviders.includes(providerName),
            provide: data => incomingDataProvided(providerName, data)
          })
          initializedLiveProviders.push(providerName)
        } else {
          updateState('actionResults', providerName, providerBeingExecuted)
        }
      }
    }

    updateState('actionResults', 'getNativeCommands', nativeCommands)
    updateState('actionResults', 'route', global.window.location)
    updateState('actionResults', 'parseRootNodeDataset', { ...rootNode.dataset })

    await runProviders()
    rootNode.innerHTML = ''
    renderApp(() => renderPage({ actionResults: state.actionResults, getSlot: createSlotRenderer() }), rootNode)

    if (typeof setupProps.afterProviders === 'function') {
      setupProps.afterProviders()
    }

    return {
      commands: boundCommands,
      store: state.actionResults
    }
  }
}
