const cors = require('../middlewares/cors')
module.exports = (app) => {
  app.disable('x-porwered-by')
  app.use(cors)
}
