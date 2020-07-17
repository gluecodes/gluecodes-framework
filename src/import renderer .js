import renderer from '../../../../init/renderer'
import styles from './styles.css'
import fa from '../../../../init/fontAwesome'
import logo from '../../../../mediaFiles/images/logo.png'
import { removePage } from '../../../../reusables/models/app/index'

export default ({
  actionResults,
  actions
}) => (
  <div className={styles.container}>
    <a href="https://www.glue.codes" target="_blank" className={styles.logo}><img alt="GlueCodes" src={logo.src}/></a>
    <div className={styles.storeButtonWrapper} title="Component repository (in the future)">
      <button className={styles.shopButton} onclick={() => actions.setComponentStoreVisibility(true)}>
        <i className={`${styles.icon} ${fa.fas} ${fa['fa-store']}`}/>
      </button>
    </div>
    <div className={styles.home}>
      {actionResults.parseUrlQueryParams.edit && !['dependencies'].includes(actionResults.parseUrlQueryParams.edit) ? (
        <select
          className={styles.navigationSelect}
          onchange={(e) => {
            global.location = `/ide.html?appId=${actionResults.parseUrlQueryParams.appId}&edit=${actionResults.parseUrlQueryParams.edit}&id=${e.target.value}`
          }}>
          {actionResults.parseUrlQueryParams.edit === 'page' ? actionResults.getAppPagesLive.map(page => (
            <option value={page.id} selected={page.id === actionResults.parseUrlQueryParams.id}>{page.navName}</option>
          )) : null}
          {actionResults.parseUrlQueryParams.edit === 'reusableSlot' ? actionResults.getAppReusableSlotsLive.map(id => (
            <option value={id} selected={id === actionResults.parseUrlQueryParams.id}>{id}</option>
          )) : null}
          {actionResults.parseUrlQueryParams.edit === 'provider' ? actionResults.getAppProvidersLive.map(id => (
            <option value={id} selected={id === actionResults.parseUrlQueryParams.id}>{id}</option>
          )) : null}
          {actionResults.parseUrlQueryParams.edit === 'command' ? actionResults.getAppCommandsLive.map(id => (
            <option value={id} selected={id === actionResults.parseUrlQueryParams.id}>{id}</option>
          )) : null}
        </select>
      ) : null}
      {actionResults.parseUrlQueryParams.edit && ['page'].includes(actionResults.parseUrlQueryParams.edit) ? [
        (
          <a className={`${styles.livePreview}`} href={`/previewPage.html?appId=${actionResults.parseUrlQueryParams.appId}&pageId=${actionResults.parseUrlQueryParams.id}`} target="__blank" title="Preview this app">
            <i className={`${styles.icon} ${fa.fas} ${fa['fa-eye']}`}/>
          </a>
        ),
        (
          <label className={styles.addRemoveWrapper}>
            <input type="checkbox" className={styles.checkbox} onchange={e => e.target.nextSibling.focus()}/>
            <input className={styles.uniqueId} type="text" placeholder="uniqueId" onkeyup={(e) => {
              if (e.code === 'Enter') {
                global.open(`/ide.html?appId=${actionResults.parseUrlQueryParams.appId}&edit=page&id=${e.target.value}&justCreated=1`, '_blank')
              }

              if (['Enter', 'Escape'].includes(e.code)) {
                e.target.previousSibling.checked = false
                e.target.value = ''
              }
            }}/>
            <span className={`${styles.navigationButton}`} title="Create a new page">Create</span>
            {
              actionResults.parseUrlQueryParams.id !== 'index' ? (
                <label
                  className={`${styles.navigationButton}`}
                  title="Remove this page"
                  onmousedown={(e) => {
                    if (e.target.closest(`.${styles.navigationButton}`).querySelector(`.${styles.checkbox}`).checked) {
                      removePage({
                        appId: actionResults.parseUrlQueryParams.appId,
                        pageId: actionResults.parseUrlQueryParams.id
                      })

                      global.close()
                    }
                  }}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}/>
                  <span>Are you sure?</span>
                  {'  Remove'}
                </label>
              ) : null
            }
          </label>
        )
      ] : null}
    </div>
    <div className={styles.navigation}>
      {
        actionResults.getSecondaryNavOrder.map(order => [
          (
            <select
              className={styles.navigationSelect}
              onchange={(e) => {
                if (e.target.value) {
                  global.open(`/ide.html?appId=${actionResults.parseUrlQueryParams.appId}&edit=command&id=${e.target.value}`, '_blank')
                  e.target.value = ''
                }
              }}>
              <option value="">[Command]</option>
              {actionResults.getAppCommandsLive.map(id => (
                <option value={id}>{id}</option>
              ))}
            </select>
          ),
          (
            <a className={`${styles.navigationButton}`} href={`/ide.html?appId=${actionResults.parseUrlQueryParams.appId}&edit=dependencies`} target="__blank" title="Manage third-party library imports">Dependencies</a>
          ),
          (
            <select
              className={styles.navigationSelect}
              onchange={(e) => {
                if (e.target.value) {
                  global.open(`/ide.html?appId=${actionResults.parseUrlQueryParams.appId}&edit=page&id=${e.target.value}`, '_blank')
                  e.target.value = ''
                }
              }}>
              <option value="">[Page]</option>
              {actionResults.getAppPagesLive.map(page => (
                <option value={page.id}>{page.navName}</option>
              ))}
            </select>
          ),
          (
            <select
              className={styles.navigationSelect}
              onchange={(e) => {
                if (e.target.value) {
                  global.open(`/ide.html?appId=${actionResults.parseUrlQueryParams.appId}&edit=provider&id=${e.target.value}`, '_blank')
                  e.target.value = ''
                }
              }}>
              <option value="">[Provider]</option>
              {actionResults.getAppProvidersLive.map(id => (
                <option value={id}>{id}</option>
              ))}
            </select>
          ),
          (
            <select
              className={styles.navigationSelect}
              onchange={(e) => {
                if (e.target.value) {
                  global.open(`/ide.html?appId=${actionResults.parseUrlQueryParams.appId}&edit=reusableSlot&id=${e.target.value}`, '_blank')
                  e.target.value = ''
                }
              }}>
              <option value="">[Reusable slot]</option>
              {actionResults.getAppReusableSlotsLive.map(id => (
                <option value={id}>{id}</option>
              ))}
            </select>
          )
        ][order])
      }
    </div>
    <div className={styles.implement}>
      {actionResults.parseUrlQueryParams.edit && (['reusableSlot', 'page', 'provider'].includes(actionResults.parseUrlQueryParams.edit)) ? (
        <div>
          <select className={styles.navigationSelect} onchange={(e) => {
            if (!e.target.value) { return }

            const [groupType, generatorIndex] = e.target.value.split('_')

            actions.generateMissingImplementation({
              appId: actionResults.parseUrlQueryParams.appId,
              missingImplementations: actionResults.getMissingImplementationsLive.records,
              generatorIndex,
              groupType,
              transformationResults: actionResults.getMissingImplementationsLive.transformationResults
            })

            e.target.value = ''
          }}>
            <option value="">Implement...</option>
            {actionResults.getMissingImplementationsLive.records.map(group => (
              <optgroup label={group.name}>
                {group.generate.map((object, index) => (
                  <option value={`${group.type}_${index}`}>{`${object.message}`}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <span className={`${styles.implementLabel} ${actionResults.getMissingImplementationsLive.count === 0 ? styles.whiteLabel : styles.redLabel}`}>{actionResults.getMissingImplementationsLive.count}</span>
        </div>
      ) : null}
    </div>
    <div className={styles.downloadButton} title="Download this app">
      <a
        href="#"
        onclick={(e) => {
          e.preventDefault()
          actions.generateCode({
            appId: actionResults.parseUrlQueryParams.appId
          })

          alert([
            '1. Unzip the downloaded code.',
            '2. In its root directory run: `docker-compose build`.',
            '3. To start the app run: `docker-compose up`.',
            '4. In another tab of terminal run:',
            '  - start by fixing possible code style issues: `docker exec -it gluecodes_demo npm run lint -- --fix`.',
            '  - prerender the app to HTML: `docker exec -it gluecodes_demo npm run prerender`.',
            '  - build the app: `docker exec -it gluecodes_demo npm run build`.',
            '5. Go to: https://localhost:3030.'
          ].join('\n'))
        }}><i className={`${styles.icon} ${styles.download} ${fa.fas} ${fa['fa-download']}`}/></a>
    </div>
    <div className={styles.cartWrapper} title="Your cart (in the future)">
      <i
        className={`${styles.icon} ${styles.shoppingCart} ${fa.fas} ${fa['fa-shopping-cart']}`}
        onclick={() => {
          alert('This will let you buy commercial components if you wish to. To make it happen we need your help.')
        }}/>
    </div>
  </div>
)
