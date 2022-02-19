const EmailValidator = require('./email-validator.js')
const validator = require('validator')
const MissingParamError = require('./errors/missing-param-error.js')

const makeSut = () => {
  return new EmailValidator()
}

describe('Email validator', () => {
  test('Should return true if validator return true', () => {
    const sut = makeSut()
    const isEmailValid = sut.isValid('valid_email@email.com')
    expect(isEmailValid).toBe(true)
  })

  test('Should return false if validator return false', () => {
    validator.isEmailValid = false
    const sut = makeSut()
    const isEmailValid = sut.isValid('invalid_email@email.com')
    expect(isEmailValid).toBe(false)
  })

  test('Should call validator if validator with correct email', () => {
    const sut = makeSut()
    const email = 'any_email@email.com'
    sut.isValid(email)
    expect(validator.email).toBe(email)
  })

  test('Should throw if no email is provided', async () => {
    const sut = makeSut()
    const promisse = sut.isValid // como não é asincrono, deve passar o ponteiro da função
    expect(promisse).toThrow(new MissingParamError('email'))
    // expect(() => { sut.isValid() }).toThrow(new MissingParamError('email'))
  })
})
