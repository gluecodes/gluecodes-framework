const { spawn } = require('child_process')

const {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync
} = require('fs')

const path = require('path')

const componentName = 'framework'
const versionsFilePath = path.resolve(__dirname, '../versions.json')
const componentsToPackPath = path.resolve(__dirname, '../dist/packages')
const doesVersionsFileExist = existsSync(versionsFilePath)

const versions = doesVersionsFileExist
  ? JSON.parse(readFileSync(versionsFilePath).toString())
  : {}

const getMergeType = (mergeMessage) => {
  const [, type = 'major'] = mergeMessage.match(/gluecodes\/([^/]+)\/\w+$/) || []

  return type
}

const gitLogCommand = spawn('git', '--no-pager log -m -1 --name-only --pretty=%s HEAD'.split(' '))
const buffer = []

gitLogCommand.stdout.on('data', (data) => {
  buffer.push(data.toString())
})

gitLogCommand.stdout.on('end', () => {
  const result = buffer.join('').split('\n')

  const [mergeMessage] = result
  const mergeType = getMergeType(mergeMessage)

  !existsSync(componentsToPackPath) && mkdirSync(componentsToPackPath)

  const version = versions[componentName] || {
    major: 1,
    minor: 0,
    patch: 0
  }

  if (doesVersionsFileExist) {
    if (mergeType === 'major') {
      version.major += 1
    } else if (mergeType === 'minor') {
      version.minor += 1
    } else if (mergeType === 'patch') {
      version.patch += 1
    }
  }

  const versionAsString = `${version.major}.${version.minor}.${version.patch}`
  const componentDirName = `${componentName}-${versionAsString}`
  const componentPath = `${componentsToPackPath}/${componentDirName}`

  console.log('creating:', `${componentName}-${versionAsString}`)

  !existsSync(componentPath) && mkdirSync(componentPath)
  copyFileSync(`${__dirname}/../dist/bundles/main.bundle.js`, `${componentPath}/index.js`)

  writeFileSync(`${componentPath}/package.json`, JSON.stringify({
    name: `@gluecodes/${componentName}`,
    version: versionAsString,
    license: 'ISC',
    main: 'index.js',
    browser: 'index.js'
  }, undefined, 2))

  versions[componentName] = version

  spawn('tar', `-cvzf ${componentPath}.tar.gz -C ${componentsToPackPath}/ ${componentDirName}/`.split(' '))
    .stderr.on('data', (data) => {
      console.error(data.toString())
    })

  if (doesVersionsFileExist) { // create versions.json backup
    const backedVersionsDirName = `versions-${(new Date().getTime())}`
    const versionsBackupFilePath = path.resolve(__dirname, `../dist/packages/${backedVersionsDirName}`)

    copyFileSync(versionsFilePath, versionsBackupFilePath)

    spawn('tar', `-cvzf ${versionsBackupFilePath}.tar.gz -C ${path.resolve(__dirname, '../dist/packages')}/ ${backedVersionsDirName}/`.split(' '))
      .stderr.on('data', (data) => {
        console.error(data.toString())
      })
  }

  writeFileSync(versionsFilePath, JSON.stringify(versions, undefined, 2)) // update versions.json
})

gitLogCommand.stderr.on('data', (data) => {
  console.error(data.toString())
})
