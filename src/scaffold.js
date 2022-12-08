'use strict'

const { Panda, Context, Factory, Scaffold, Utility, ctx } = require('panda')
const path = require('path')
const map = require('map-stream')
const vfs = require('vinyl-fs')
const vinylContents = require('vinyl-contents')

class DevScaffold extends Scaffold {

  async copyScaffoldFile (source, dest, data, opts) {
    opts = {
      ...{
        destBase: ctx.cwd,
        overwrite: false
      },
      ...opts
    }
    const $this = this

    const destPath = path.join(opts.destBase, dest)

    if (opts.overwrite === false) await this.confirmNotExists(destPath, `Output location already exists, can't overwrite (${destPath})`)

    const vals = {
      ...ctx,
      ...data,
      data,
      Utility,
      _: Utility._
    }

    return new Promise(function(resolve, reject) {
      vfs.src(source)
        .pipe(map((file, cb) => {
          file.basename = path.basename(dest)

          vinylContents(file, async function(err, contents) {
            if (err) return cb(err)
            if (!contents) return cb()
      
            const output = await $this._template(contents.toString(), vals)
            file.contents = Buffer.from(output)
            cb(null, file)
          })
        }))
        .pipe(vfs.dest(path.dirname(destPath)))
        .on('end', resolve)
        .on('error', reject)
    })
  }

  async copyScaffold (source, dest, data, opts) {
    opts = {
      ...{
        destBase: ctx.cwd,
        overwrite: false,
        ignore: [],
        noprocess: []
      },
      ...opts
    }
    const $this = this

    const srcPaths = [
      path.join(source, '**/*')
    ]
    const destPath = path.join(opts.destBase, dest)

    if (opts.overwrite === false) await this.confirmNotExists(destPath, `Output location already exists, can't overwrite (${destPath})`)

    const vals = {
      ...ctx,
      ...data,
      data,
      Utility,
      _: Utility._
    }

    return new Promise(function(resolve, reject) {
      vfs.src(srcPaths)
        //.pipe(map($this.fileFn))
        .pipe(map((file, cb) => {
          return $this.fileFn(file, vals, cb)
        }))
        .pipe(vfs.dest(destPath))
        .on('end', resolve)
        .on('error', reject)
    })
  }

  fileFn (file, data, cb) {
    const $this = this
    let istpl = false
    if (file.stem.startsWith('_')) {
      istpl = true
      let stem = file.stem.replace('_', '')
      const rx = /\(([^()]*)\)/g
      const match = file.stem.match(/\(.*?\)/g) || []
      match.map(x => {
        const y = x.replace(/[()]/g, "") 
        const z = data[y] || x
        // if there's a match, replace value
        stem = stem.replace(x, z)
      })
      file.stem = stem
    }

    if (file.isDirectory()) return cb(null, file)

    vinylContents(file, async function(err, contents) {
      if (err) return cb(err)
      if (!contents) return cb()
 
      if (istpl) {
        const output = await $this._template(contents.toString(), data)
        file.contents = Buffer.from(output)
      }
      cb(null, file)
    })
  }
}

module.exports = DevScaffold
