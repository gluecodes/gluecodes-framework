import { createPageInitializer } from './index'
import renderSlot from './slot.jsx'
import renderPage from './layout.jsx'

const initPage = createPageInitializer({
  commands: {
    syncCommand: () => 'result of sync command',
    asyncCommand: async () => 'result of async command',
    commandThatThrowsError: () => {
      throw new Error('some error')
    },
  },
  providers: {
    syncProvider: () => 'result of sync provider',
    asyncProvider: async () => new Promise(resolve => setTimeout(() => resolve('result of async provider'), 500)),
    combiningProvider: actionResults => `${actionResults.syncProvider} and ${actionResults.asyncProvider}`,
    incomingDataProvider: actionResults => async ({
      asyncResults,
      hasBeenInitialized,
      provide
    }) => {
      if (!hasBeenInitialized) {
        let remainingSeconds = 60
        const interval = setInterval(() => {
          if (remainingSeconds === 0) {
            clearInterval(interval)
            return
          }

          provide(new Date().toLocaleTimeString())
          remainingSeconds -= 1
        }, 1000)
      }

      console.log(actionResults.otherLiveProvider)
      await asyncResults.otherLiveProvider
      console.log(actionResults.otherLiveProvider)

      provide(new Date().toLocaleTimeString())
    },
    otherLiveProvider: () => async ({ provide }) => new Promise(resolve => setTimeout(() => {
      provide('result of other live provider')
      resolve()
    }, 500))
  },
  store: {}
})

initPage({
  providers: [
    'syncProvider',
    'asyncProvider',
    'combiningProvider',
    'otherLiveProvider',
    'incomingDataProvider'
  ],
  rootNode: global.document.querySelector('#layout'),
  renderPage,
  slots: {
    content: ({ actionResults, actions }) => renderSlot({ actionResults, actions, syncCommand: actionResults.syncCommand })
  }
})
