const cors = require('../middlewares/cors')
const jsonParser = require('../middlewares/json-parser')

module.exports = (app) => {
  app.disable('x-porwered-by')
  app.use(cors)
  app.use(jsonParser)
}
