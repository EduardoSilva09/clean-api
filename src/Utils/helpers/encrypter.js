const bcrypt = require('bcrypt')
const { MissingParamError } = require('../errors')
module.exports = class Encrypter {
  async compare (value, hashedValue) {
    if (!value) {
      return new MissingParamError('value')
    }
    if (!hashedValue) {
      return new MissingParamError('hashedValue')
    }
    const isValid = await bcrypt.compare(value, hashedValue)
    return isValid
  }
}
