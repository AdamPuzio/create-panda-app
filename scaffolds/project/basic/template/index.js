'use strict';

const { Panda, Hub, Project, Utility } = require('panda')

async function run() {
  const project = new Project()
  // load the project config
  await project.load('{PROJECT_PATH}/project.json')

  // run the project with the loaded config
  const info = project.info()
  await Hub.run('*', info)

  // determine the port and open the app in the browser dynamically
  try {
    const webAppConfig = Hub.getAppConfig('web')
    const port = webAppConfig.app.port || 5000
    const url = `http://localhost:${port}`
    Utility.openBrowser(url)
  } catch (err) {
    Hub.logger.info(`Unable to open up browser, please do it manually`)
    Hub.logger.error(err)
  }
}

run()