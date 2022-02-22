const request = require('supertest')
const app = require('../config/app')

describe('CORS Middleware', () => {
  test('Should enabled CORS', async () => {
    app.get('/test_CORS', (req, res) => {
      res.send('')
    })
    const res = await request(app).get('/test_CORS')
    expect(res.headers['access-control-allow-origin']).toBe('*')
    expect(res.headers['access-control-allow-methods']).toBe('*')
    expect(res.headers['access-control-allow-headers']).toBe('*')
  })
})
