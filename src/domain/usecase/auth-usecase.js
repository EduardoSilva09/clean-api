const { MissingParamError } = require('../../Utils/errors')
module.exports = class AuthUseCase {
  constructor ({ loadUseByEmailRepository, updateAccessTokenRepository, encripter, tokenGenerator } = {}) {
    this.loadUseByEmailRepository = loadUseByEmailRepository
    this.updateAccessTokenRepository = updateAccessTokenRepository
    this.encripter = encripter
    this.tokenGenerator = tokenGenerator
  }

  async auth (email, password) {
    if (!email) {
      throw new MissingParamError('email')
    }
    if (!password) {
      throw new MissingParamError('password')
    }
    const user = await this.loadUseByEmailRepository.load(email)
    const isValid = user && await this.encripter.compare(password, user.password)
    if (isValid) {
      const accessToken = await this.tokenGenerator.generate(user.id)
      await this.updateAccessTokenRepository.update(user.id, accessToken)
      return accessToken
    }
    return null
  }
}
