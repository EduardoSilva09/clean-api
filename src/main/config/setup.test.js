const request = require('supertest')
const app = require('./app')

describe('App test', () => {
  test('Should disable x-porwered-by header', async () => {
    app.get('/test_x_powered_by', (req, res) => {
      res.send('')
    })
    const res = await request(app).get('/test_x_powered_by')
    expect(res.headers['x-porwered-by']).toBeUndefined()
  })

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
