export default ({
  actionResults,
  actions
}) => (
  <>
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
      >Command that throws an error</button>{JSON.stringify(actionResults.errors.Error)}
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
  </>
)
