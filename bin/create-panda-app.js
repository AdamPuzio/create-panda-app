#!/usr/bin/env node

const { Terminal, Command } = require('panda')
const packageJson = require('../package.json')
const path = require('path')

// clear the console
Terminal.clear()

// make sure the current version of Node is valid
Terminal.versionCheck()

new Command({
  command: 'create-panda-app',
  title: 'create-panda-app',
  description: 'Generate a new Panda project from a scaffold',
  usage: 'create-panda-app <project-name> [options]',
  version: packageJson.version,
  arguments: [
    {
      name: 'project-name',
      defaultOption: true,
      required: true
    }
  ],
  options: [
    {
      name: 'help',
      alias: 'h',
      type: Boolean,
      description: 'Display help',
      group: 'global'
    },
    {
      name: 'interactive',
      alias: 'i',
      type: Boolean,
      description: 'Run in interactive mode',
      group: 'app'
    },
    {
      name: 'template',
      type: String,
      description: 'Use a custom template (kitchen-sink|empty)',
      group: 'app'
    },
    {
      name: 'debug',
      alias: 'd',
      type: Boolean,
      description: 'Run in debug mode (add library name to debug for just that lib)',
      group: 'global'
    },
    {
      name: 'log-level',
      type: String,
      description: 'Set the log level',
      group: 'logging'
    },
    {
      name: 'log-format',
      type: String,
      description: 'Set the logging output format',
      group: 'logging'
    }
  ],
  action: async function (args, opts, all) {
    this.debug('command: command:create')

    this.heading('Create a new Panda Application')

    // check to make sure we are in a Project, Panda, or PandaCLI directory
    await this.locationTest(['notInProject', 'notInPanda', 'notInPackage'], { operator: 'OR' })

    if (opts.help === true) {
      // display help
      this.generateHelp()
    } else if (!args.projectName) {
      // missing argument, show helper
      const color = Terminal.color
      this.out('Please specify the project directory:')
      this.out(`  ${color.blue('create-panda-app')} ${color.green('<project-directory>')}`)
      this.out('')
      this.out('For example:')
      this.out(`  ${color.blue('create-panda-app')} ${color.green('my-panda-app')}`)
      this.out('')
      this.out(`Run ${color.blue('create-panda-app --help')} to see all options`)
    } else if (opts.interactive === true) {
      // run in interactive mode
      this.error(`Interactive mode is not configured yet`)
    } else { // process new app

      // get the specific template to use
      const template = opts.template || 'basic'
      try {
        // attempt to load the template's scaffold file
        const projectScaffold = require(`../scaffolds/project/${template}/scaffold`)
        // run the build process
        this.logger.info(`Building application from template...`)
        this.logger.debug(`template: ${template}`)
        this.spacer()
        await projectScaffold.build({
          name: args.projectName
        })
      } catch (err) {
        // error out if that scaffold file can't be loaded
        this.logger.debug(err)
        return this.logger.error(`There was an error trying to load the '${template}' template`)
      }

      this.logger.info(`Setup was successful`)
      this.spacer()
      this.logger.info(`Run the following to start your new app:`)
      this.logger.info(`  cd ${args.projectName}`)
      this.logger.info(`  npm start`)
    }
  }
}).parse()
