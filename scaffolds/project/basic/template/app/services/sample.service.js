'use strict'

const Panda = require('panda')
const Service = Panda.entity('service')

module.exports = new Service('sample', {

  // any mixins that should be used
  mixins: [],

  // dependencies on other services
  dependencies: [],

  // static store, reached via this.settings
  settings: {},

  // service metadata, reached via this.metadata
  metadata: {},

  // callable/public methods of the service (accessed via broker.call('sample.example'))
  actions: {
    hello: {
      params: {
        name: { type: 'string', optional: true }
      },
      async handler (ctx) {
        let output = 'Hello'
        if (ctx.params.name) output += `, ${ctx.params.name}`
        return output
      }
    }
  },

  // private methods of this service
  methods: {},

  // subscribable events of other services
  events: {},

  // lifecycle events
  created () {},
  merged () {},
  async started () {},
  async stopped () {}
})