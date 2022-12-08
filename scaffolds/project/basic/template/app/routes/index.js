const { Router, Logger } = require('panda')
const router = new Router()
const logger = Logger.getLogger('Router')

const defaultTemplate = 'layouts/default'

/**
 * Error handler catch-all
 */
router.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    logger.error(err)
    // set status to 500 if not specified
    ctx.status = err.statusCode || err.status || 500
    await ctx.render('500', { layout: defaultTemplate, error: err })
  }
})

/**
 * homepage - basic view render
 * 
 * view: app/ui/views/pages/home.html
 * layout: app/ui/views/templates/default.html
 */
router.get('/', async (ctx, next) => {
  await ctx.render('pages/home', { layout: defaultTemplate })
})

/**
 * docs/features/other pages - basic view render with some url sugar
 * 
 * view: app/ui/views/pages/<page>.html
 * layout: app/ui/views/templates/default.html
 */
router.get('/(docs|features|other)', async (ctx, next) => {
  await ctx.render(`pages/${ctx.params['0']}`, { layout: defaultTemplate })
})

/**
 * bootstrap docs - custom layout
 * 
 * view: app/ui/views/pages/cheatsheet.html
 * layout: app/ui/views/templates/no-nav.html
 */
 router.get('/bootstrap/(cheatsheet|grid)', async (ctx, next) => {
  await ctx.render(`pages/bootstrap/${ctx.params['0']}`, { layout: 'layouts/no-nav' })
})

/**
 * Dynamic URL variables
 */
router.get('/articles/:id', async (ctx, next) => {
  const post = { id: ctx.params.id }
  await ctx.render('pages/article', { post, layout: defaultTemplate })
})

/**
 * Login GET and POST
 * (note: no login functionality actually happens)
 * 
 * GET renders the login page
 * POST processes the request and redirects to the homepage
 */
router.get('/login', async (ctx, next) => {
  await ctx.render('pages/login', { layout: defaultTemplate })
})

router.post('/login', async (ctx, next) => {
  logger.debug(`logging in with email: ${ctx.request.body.email}`)
  ctx.redirect('/')
  ctx.status = 301
})

/**
 * Not trying to render any pages, just output the date
 */
router.get('/time', async (ctx, next) => {
  const time = new Date()
  ctx.body = `time: ${time}`
})

/**
 * Makes a call to the Sample service
 */
router.get('/service-call', async (ctx, next) => {
  // if the url includes a query parameter of name, use it, otherwise default to Max
  const name = ctx.query.name || 'Max'
  // pass the name to the service via the broker
  const greeting = await ctx.broker.call('sample.hello', { name })
  ctx.body = `${greeting}`
})

/**
 * Gets Moleculer $node information
 */
router.get('/metrics', async (ctx, next) => {
  const list = await ctx.broker.call('$node.list')
  const services = await ctx.broker.call('$node.services')
  const actions = await ctx.broker.call('$node.actions')
  const events = await ctx.broker.call('$node.events')
  //const metrics = await ctx.broker.call('$node.metrics')
  const options = await ctx.broker.call('$node.options')
  const health = await ctx.broker.call('$node.health')

  const data = { list, services, actions, events, options, health }
  await ctx.render('pages/metrics', { data, layout: defaultTemplate })
  //ctx.body = `${JSON.stringify(data, null, 2)}`
})

/**
 * Gets Moleculer $node health information
 */
router.get('/~health', async (ctx, next) => {
  const health = await ctx.broker.call('$node.health')
  ctx.body = `${JSON.stringify(health, null, 2)}`
})

router.get('/error', async (ctx, next) => {
  const noexist = this.doesnt.exist
})

/**
 * Catch-all to render a 404 page
 * 
 * use (.*) or /:splat*
 */
router.get('/:splat*', async (ctx, next) => {
  await ctx.render('404', { url: ctx.params.splat, layout: defaultTemplate })
})

module.exports = router
