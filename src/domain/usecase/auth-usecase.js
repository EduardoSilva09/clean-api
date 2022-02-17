const { MissingParamError, InvalidParamError } = require('../../Utils/errors')
module.exports = class AuthUseCase {
  constructor (loadUseByEmailRepository) {
    this.loadUseByEmailRepository = loadUseByEmailRepository
  }

  async auth (email, password) {
    if (!email) {
      throw new MissingParamError('email')
    }
    if (!password) {
      throw new MissingParamError('password')
    }
    if (!this.loadUseByEmailRepository) {
      throw new MissingParamError('loadUseByEmailRepository')
    }
    if (!this.loadUseByEmailRepository.load) {
      throw new InvalidParamError('loadUseByEmailRepository')
    }
    const user = await this.loadUseByEmailRepository.load(email)
    if (!user) {
      return null
    }
  }
}
