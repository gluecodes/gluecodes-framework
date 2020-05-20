const { expect } = require('chai')

const { createPageInitializer } = require('../../dist/main.bundle')

describe('api', () => {
  it('should throw TypeError setupProps.afterProviders is other than a function', async () => {
    try {
      createPageInitializer({
        afterProviders: null
      })
    } catch (err) {
      expect(err.name).to.equal('TypeError')
      return
    }

    throw new Error('Error expected')
  })

  it('should throw TypeError setupProps.commands is other than an object', async () => {
    try {
      createPageInitializer({
        commands: null
      })
    } catch (err) {
      expect(err.name).to.equal('TypeError')
      return
    }

    throw new Error('Error expected')
  })

  it('should throw TypeError setupProps.providers is other than an object', async () => {
    try {
      createPageInitializer({
        commands: {},
        providers: null
      })
    } catch (err) {
      expect(err.name).to.equal('TypeError')
      return
    }

    throw new Error('Error expected')
  })

  it('should throw TypeError setupProps.store is other than an object', async () => {
    try {
      createPageInitializer({
        commands: {},
        providers: {},
        store: null
      })
    } catch (err) {
      expect(err.name).to.equal('TypeError')
      return
    }

    throw new Error('Error expected')
  })

  it('should return a function', () => {
    const initPage = createPageInitializer({
      commands: {},
      providers: {},
      store: {}
    })

    expect(initPage).to.be.a('function')
  })

  it('should throw TypeError when providers is other than an array', async () => {
    const initPage = createPageInitializer({
      commands: {},
      providers: {},
      store: {}
    })

    try {
      await initPage({
        providers: null
      })
    } catch (err) {
      expect(err.name).to.equal('TypeError')
      return
    }

    throw new Error('Error expected')
  })

  it('should throw TypeError when renderPage is other than a function', async () => {
    const initPage = createPageInitializer({
      commands: {},
      providers: {},
      store: {}
    })

    try {
      await initPage({
        renderPage: undefined
      })
    } catch (err) {
      expect(err.name).to.equal('TypeError')
      return
    }

    throw new Error('Error expected')
  })

  it('should throw TypeError when rootNode is other than HTML Element', async () => {
    const initPage = createPageInitializer({
      commands: {},
      providers: {},
      store: {}
    })

    try {
      await initPage({
        renderPage: () => {},
        rootNode: {}
      })
    } catch (err) {
      expect(err.name).to.equal('TypeError')
      return
    }

    throw new Error('Error expected')
  })

  it('should throw TypeError when slots is other than an object', async () => {
    const initPage = createPageInitializer({
      commands: {},
      providers: {},
      store: {}
    })
    const MockedHtmlElement = function HTMLDivElement () {}

    try {
      await initPage({
        renderPage: () => {},
        rootNode: new MockedHtmlElement(),
        slots: []
      })
    } catch (err) {
      expect(err.name).to.equal('TypeError')
      return
    }

    throw new Error('Error expected')
  })
})
