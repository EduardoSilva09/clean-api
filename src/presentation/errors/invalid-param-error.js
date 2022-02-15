module.exports = class InvalidParamError extends Error {
  constructor () {
    super('Invalid Param error')
    this.name = 'InvalidParamError'
  }
}
