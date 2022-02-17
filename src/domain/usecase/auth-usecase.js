const { MissingParamError, InvalidParamError } = require('../../Utils/errors')
module.exports = class AuthUseCase {
  constructor (loadUseByEmailRepository, encripter) {
    this.loadUseByEmailRepository = loadUseByEmailRepository
    this.encripter = encripter
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
    await this.encripter.compare(password, user.password)
    return null
  }
}
