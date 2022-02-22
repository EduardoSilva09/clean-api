const cors = require('../middlewares/cors')
const jsonParser = require('../middlewares/json-parser')
const contentType = require('../middlewares/content-type')

module.exports = (app) => {
  app.disable('x-porwered-by')
  app.use(cors)
  app.use(jsonParser)
  app.use(contentType)
}
