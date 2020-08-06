import diff from 'virtual-dom/diff'
import parser from 'vdom-parser'
import patch from 'virtual-dom/patch'

const vDomState = {
  rootNode: undefined,
  vDomTree: undefined
}

const mountPage = (newVDomTree) => {
  vDomState.rootNode = patch(vDomState.rootNode, diff(vDomState.vDomTree, newVDomTree))
  vDomState.vDomTree = newVDomTree
}

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

    const actionResults = { ...setupProps.store, errors: {} }
    const handleError = (error) => {
      if (!actionResults.errors[error.name]) {
        actionResults.errors[error.name] = error
      } else {
        Object.getOwnPropertyNames(error)
          .reduce((acc, propName) => Object.assign(acc, { [propName]: error[propName] }), actionResults.errors[error.name])

        actionResults.errors[error.name].isCancelled = false
      }

      actionResults.errors[error.name].throwCount = actionResults.errors[error.name].throwCount || 0
      actionResults.errors[error.name].throwCount += 1

      if (error.due) {
        Object.assign(
          actionResults.errors,
          error.due.reduce((acc, error) => ({ ...acc, [error.name]: error }), {})
        )
      }

      mountPage(renderPage({ actionResults, getSlot: createSlotRenderer() }))
    }
    const allCommands = {
      ...setupProps.commands,
      cancelError: ({ errorName }) => {
        if (actionResults.errors[errorName]) {
          actionResults.errors[errorName].isCancelled = true

          if (actionResults.errors[errorName].due) {
            actionResults.errors[errorName].due.forEach((error) => {
              error.isCancelled = true
            })
          }
        }
      },
      redirect (path) {
        global.window.location = `${global.window.location.origin}/${path}`
      },
      reload: async () => {
        await runProviders()
        mountPage(renderPage({ actionResults, getSlot: createSlotRenderer() }))
      },
      runTogether: async (commandsToRun) => {
        for (const command of commandsToRun) {
          const [commandName, ...args] = command
          const commandBeingExecuted = allCommands[commandName](...args)

          if (commandBeingExecuted instanceof Promise) {
            actionResults[commandName] = await commandBeingExecuted.catch(handleError)
          } else {
            actionResults[commandName] = commandBeingExecuted
          }
        }

        mountPage(renderPage({ actionResults, getSlot: createSlotRenderer() }))
      },
      fail: handleError
    }
    const createSlotRenderer = (commandBeingExecuted = null) => ({ id }) => {
      if (slots[id]) {
        return hostData => slots[id]({
          actionResults,
          actions: boundCommands,
          commandBeingExecuted,
          hostData
        })
      }

      return () => null
    }
    const boundCommands = Object.keys(allCommands).reduce((acc, commandName) => (
      !['fail', 'redirect', 'reload', 'runTogether'].includes(commandName) ? {
        ...acc,
        [commandName]: (...args) => {
          try {
            const commandBeingExecuted = allCommands[commandName](...args)

            if (commandBeingExecuted instanceof Promise) {
              mountPage(renderPage({ actionResults, getSlot: createSlotRenderer(commandName) }))
              return commandBeingExecuted
                .then((result) => {
                  actionResults[commandName] = result
                  mountPage(renderPage({ actionResults, getSlot: createSlotRenderer() }))
                })
                .catch(handleError)
            }
            actionResults[commandName] = commandBeingExecuted
            mountPage(renderPage({ actionResults, getSlot: createSlotRenderer() }))
            return actionResults[commandName]
          } catch (err) {
            console.error(err)
            handleError(err)
          }
        }
      } : acc
    ), allCommands)
    const incomingDataProvided = (providerName, data) => {
      actionResults[providerName] = data
      liveProviderPromises.priv[providerName].resolve(data)
      mountPage(renderPage({ actionResults, getSlot: createSlotRenderer() }))
    }
    const liveProviderPromises = { priv: {}, pub: {} }
    const runProviders = async () => {
      for (const providerName of providers) {
        const providerBeingExecuted = setupProps.providers[providerName](actionResults)

        if (providerBeingExecuted instanceof Promise) {
          actionResults[providerName] = await providerBeingExecuted
        } else if (typeof providerBeingExecuted === 'function') {
          liveProviderPromises.pub[providerName] = new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(new Error(`Provider: '${providerName}' didn't resolve within 20s, make sure all its preceding providers exist in the provider pipeline`))
            }, 20000)
            liveProviderPromises.priv[providerName] = { resolve }
          })
          providerBeingExecuted({
            asyncResults: liveProviderPromises.pub,
            hasBeenInitialized: !!liveProviderPromises.pub[providerName],
            provide: data => incomingDataProvided(providerName, data)
          })
        } else {
          actionResults[providerName] = providerBeingExecuted
        }
      }
    }

    actionResults.rerender = () => mountPage(renderPage({ actionResults, getSlot: createSlotRenderer() }))
    actionResults.fail = handleError
    actionResults.route = global.window.location
    actionResults.parseRootNodeDataset = { ...rootNode.dataset }
    vDomState.rootNode = rootNode

    if (!vDomState.vDomTree) {
      vDomState.vDomTree = parser(rootNode)
    }

    await runProviders()
    mountPage(renderPage({ actionResults, getSlot: createSlotRenderer() }))

    if (typeof setupProps.afterProviders === 'function') {
      setupProps.afterProviders()
    }
  }
}
