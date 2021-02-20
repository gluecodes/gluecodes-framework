const haveStateChanged = (existingState, newState) => {
  if (newState === existingState) {
    return false
  }

  if (typeof existingState === 'undefined') {
    return true
  }

  if (['Array', 'Object'].includes(existingState?.constructor.name)) {
    if (!['Array', 'Object'].includes(newState?.constructor.name)) {
      return true
    }

    return JSON.stringify(newState) !== JSON.stringify(existingState)
  }

  return true
}

export default (setupProps) => {
  const { onCreateAppState, onRenderApp } = setupProps

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

    const [state, updateState] = onCreateAppState({
      actionResults: {
        reload: undefined,
        parseRootNodeDataset: { ...rootNode.dataset },
        route: global.window.location,
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

    const updateActionResult = (actionName, result) => {
      if (result?.constructor.name === 'Object') {
        updateState('actionResults', actionResults => ({
          ...actionResults,
          [actionName]: result
        }))
      } else {
        updateState('actionResults', actionName, result)
      }
    }

    const handleError = (error) => {
      const serializableError = Object.getOwnPropertyNames(error)
        .reduce((acc, propName) => ({
          ...acc,
          [propName]: error[propName]
        }), {})

      updateState('actionResults', 'errors', error.name, {
        ...serializableError,
        isCancelled: false,
        throwCount: (state.actionResults.errors[error.name]?.throwCount ? state.actionResults.errors[error.name].throwCount : 0) + 1
      })

      if (error.due) {
        error.due.forEach((error) => {
          handleError(error)
        })
      }
    }
    const nativeCommands = {
      cancelError: ({ errorName }) => {
        if (state.actionResults.errors[errorName]) {
          updateState('actionResults', 'errors', errorName, 'isCancelled', true)

          if (state.actionResults.errors[errorName].due) {
            state.actionResults.errors[errorName].due.forEach((error) => {
              updateState('actionResults', 'errors', error.name, 'isCancelled', true)
            })
          }
        }
      },
      redirect (path) {
        global.window.location = `${global.window.location.origin}/${path}`
      },
      reload: async (type = 'full') => {
        // console.log('full reload')
        updateState('actionResults', 'reload', type)
        await runProviders()
      },
      rerender: () => updateState('actionResults', { ...state.actionResults, forceRerender: (new Date().getTime()) }),
      runTogether: async (commandsToRun) => {
        try {
          const commandResults = {}
          let reloadArgs

          for (const command of commandsToRun) {
            const [commandName, ...args] = command

            if (commandName === 'reload') {
              reloadArgs = args
              continue
            }

            const commandBeingExecuted = allCommands[commandName](...args)

            if (commandBeingExecuted instanceof Promise) {
              commandResults[commandName] = await commandBeingExecuted
            } else {
              commandResults[commandName] = commandBeingExecuted
            }
          }

          updateState('actionResults', actionResults => ({
            ...actionResults,
            ...commandResults
          }))

          if (reloadArgs) {
            allCommands.reload(...reloadArgs)
          }
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
            updateActionResult(commandName, commandBeingExecuted)
            return commandBeingExecuted
              .then((result) => {
                updateActionResult(commandName, result)
              })
              .catch(handleError)
          }

          updateActionResult(commandName, commandBeingExecuted)
          return commandBeingExecuted
        } catch (err) {
          handleError(err)
        }
      }
    }), { ...nativeCommands })
    const incomingDataProvided = (providerName, result) => {
      liveProviderPromises.priv[providerName].resolve(result)

      if (haveStateChanged(state.actionResults[providerName], result)) {
        // console.log(providerName, state.actionResults[providerName], result)
        updateActionResult(providerName, result)
      }
    }
    const liveProviderPromises = { priv: {}, pub: {} }
    const initializedLiveProviders = []
    const runProviders = async () => {
      for (const providerName of providers) {
        const providerBeingExecuted = setupProps.providers[providerName](state.actionResults)

        if (providerBeingExecuted instanceof Promise) {
          const result = await providerBeingExecuted

          if (haveStateChanged(state.actionResults[providerName], result)) {
            // console.log(providerName, state.actionResults[providerName], result)
            updateActionResult(providerName, result)
          }
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
        } else if (haveStateChanged(state.actionResults[providerName], providerBeingExecuted)) {
          // console.log(providerName, state.actionResults[providerName], providerBeingExecuted)
          updateActionResult(providerName, providerBeingExecuted)
        }
      }
    }

    updateState('actionResults', 'getNativeCommands', nativeCommands)

    await runProviders()
    rootNode.innerHTML = ''
    onRenderApp(() => renderPage({ actionResults: state.actionResults, getSlot: createSlotRenderer() }), rootNode)

    if (typeof setupProps.afterProviders === 'function') {
      setupProps.afterProviders()
    }

    return {
      commands: boundCommands,
      store: state.actionResults
    }
  }
}
