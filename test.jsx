import { createPageInitializer } from './index'

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
    combiningProvider: actionResults => `${actionResults.syncProvider} and ${actionResults.asyncProvider}}`,
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
  renderPage: ({ getSlot }) => {
    return (<div>{getSlot({ id: 'content' })}</div>)
  },
  slots: {
    content: ({ actionResults, actions }) => (
      <div>
        <p>Provider results: {actionResults.combiningProvider}</p>
        <p>Incoming data provider result: {actionResults.incomingDataProvider}</p>
        <p>
          <button
            onClick={() => {
              actions.syncCommand()
            }}
          >Sync command</button>{` ${actionResults.syncCommand || ''}`}
        </p>
        <p>
          <button
            onClick={() => {
              actions.asyncCommand()
            }}
          >Async command</button>{` ${!actionResults.asyncCommand || actionResults.asyncCommand instanceof Promise ? '' : actionResults.asyncCommand }`}
        </p>
        <p>
          <button
            onClick={() => {
              actions.commandThatThrowsError()
            }}
          >Command that throws an error</button>{JSON.stringify(actionResults.errors)}
          <button
            onClick={() => {
              actions.cancelError({ errorName: 'Error' })
            }}
          >Cancel error</button>
        </p>
        <p>
          <button
            onClick={() => {
              actions.runTogether([
                ['syncCommand'],
                ['asyncCommand']
              ])
            }}
          >Run commands together</button>{` ${actionResults.syncCommand} and ${actionResults.asyncCommand}`}
        </p>
        <p>
          <button
            onClick={() => {
              actions.runTogether([
                ['syncCommand'],
                ['asyncCommand'],
                ['reload']
              ])
            }}
          >Reload after running commands</button>{Object.keys(actionResults).map(key => `${key}: ${JSON.stringify(actionResults[key])}`).join(', ')}
        </p>
      </div>
    )
  }
})
