const router = require('express').Router()
const fp = require('fast-glob')

module.exports = app => {
  app.use('/api', router)
  fp.sync('**/src/main/routes/**.js').forEach(file => require(`../../../${file}`)(router))
}
