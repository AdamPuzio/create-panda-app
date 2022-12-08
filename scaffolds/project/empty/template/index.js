'use strict';

const { Panda, Hub, Project } = require('panda')

async function run() {
  const projectFile = require('./project.json')
  const project = new Project()
  await project.load('{PROJECT_PATH}/project.json')
  const info = project.info()
  
  Hub.run('*', info)
}

run()