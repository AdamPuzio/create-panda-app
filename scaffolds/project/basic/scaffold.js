'use strict'

const { Panda, Context, Factory, Utility, ctx } = require('panda')
const Scaffold = require('../../../src/scaffold')
const helpers = Scaffold.helpers
const path = require('path')
const _ = require('lodash')

module.exports = new Scaffold({
  namespace: 'panda.scaffold.project.basic',
  name: 'Basic Web App',
  description: 'Web server with minimal files',

  // prompts user for questions
  interface: [
    // desc
    helpers.questions.desc(),
    helpers.questions.port(),
    // tools & utilities
    helpers.questions.buildTool(),
    helpers.questions.testTool(),
    helpers.questions.cssTool(),
    helpers.questions.lintTool()
  ],

  // build project
  async build (data) {
    this.logger.debug(`Project Scaffold [basic] build()`)
    const srcDir = path.join(__dirname, 'template')
    const destDir = data.name
    // assign default values
    data = Object.assign({
      desc: '',
      port: 5000,
      buildTool: null,
      testTool: 'jest',
      cssTool: 'sass',
      lintTool: 'standardjs'
    }, data)
    this.confirmNotExists(destDir)

    const cfg = {}
    await this.copyScaffold(srcDir, destDir, data, cfg)
    let pjson = await Factory.buildPackageJson({
      name: data.name,
      description: data.desc,
      main: `index.js`
    })
    pjson = await Factory.applyTools(pjson, Utility.pick(data, ['testTool', 'lintTool', 'cssTool', 'buildTool']))
    await Factory.writePackageJson(pjson, destDir)
    await Factory.npmInstall([], { baseDir: destDir })
    const prjson = {
      apps: [
        { app: 'web', port: data.port }
      ],
      components: [
        {
          app: 'web',
          path: '{PROJECT_PATH}/app/ui/components'
        }
      ],
      packages: [],
      routes: [
        {
          app: 'web',
          path: '{PROJECT_PATH}/app/routes'
        }
      ],
      services: [
        {
          app: 'web',
          path: '{PROJECT_PATH}/app/services'
        }
      ],
      statics: [
        {
          app: 'web',
          path: '{PROJECT_PATH}/app/static'
        }
      ],
      views: [
        {
          app: 'web',
          path: '{PROJECT_PATH}/app/ui/views'
        }
      ]
    }
    await Factory.writeProjectJson(prjson, destDir)
  }
})