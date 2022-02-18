const { MissingParamError, InvalidParamError } = require('../../Utils/errors')
const AuthUseCase = require('./auth-usecase')

const makeEncripter = () => {
  class EncripterSpy {
    async compare (password, hashedPassword) {
      this.password = password
      this.hashedPassword = hashedPassword
      return this.isValid
    }
  }
  const encripterSpy = new EncripterSpy()
  encripterSpy.isValid = true
  return encripterSpy
}

const makeTokenGenerator = () => {
  class TokenGeneratorSpy {
    async generate (userId) {
      this.userId = userId
      return this.accessToken
    }
  }
  const tokenGeneratorSpy = new TokenGeneratorSpy()
  tokenGeneratorSpy.accessToken = 'any_token'
  return tokenGeneratorSpy
}

const makeLoadUseByEmailRepository = () => {
  class LoadUseByEmailRepositorySpy {
    async load (email) {
      this.email = email
      return this.user
    }
  }
  const loadUseByEmailRepositorySpy = new LoadUseByEmailRepositorySpy()
  loadUseByEmailRepositorySpy.user = {
    id: 'Any_id',
    password: 'hashed_password'
  }
  return loadUseByEmailRepositorySpy
}

const makeSut = () => {
  const tokenGeneratorSpy = makeTokenGenerator()
  const encripterSpy = makeEncripter()
  const loadUseByEmailRepositorySpy = makeLoadUseByEmailRepository()
  const sut = new AuthUseCase(loadUseByEmailRepositorySpy, encripterSpy, tokenGeneratorSpy)
  return { sut, loadUseByEmailRepositorySpy, encripterSpy, tokenGeneratorSpy }
}

describe('Auth UseCase', () => {
  test('Should throw if no email is provided', async () => {
    const { sut } = makeSut()
    const promisse = sut.auth()
    expect(promisse).rejects.toThrow(new MissingParamError('email'))
  })

  test('Should throw if no password is provided', async () => {
    const { sut } = makeSut()
    const promisse = sut.auth('any_email@mail.com')
    expect(promisse).rejects.toThrow(new MissingParamError('password'))
  })

  test('Should call LoadUseByEmailRepository with correct email', async () => {
    const { sut, loadUseByEmailRepositorySpy } = makeSut()
    await sut.auth('any_email@mail.com', 'any_password')
    expect(loadUseByEmailRepositorySpy.email).toBe('any_email@mail.com')
  })

  test('Should throw if no LoadUseByEmailRepository is provided', async () => {
    const sut = new AuthUseCase()
    const promisse = sut.auth('any_email@mail.com', 'any_password')
    expect(promisse).rejects.toThrow(new MissingParamError('loadUseByEmailRepository'))
  })

  test('Should throw if LoadUseByEmailRepository has no method', async () => {
    const sut = new AuthUseCase({})
    const promisse = sut.auth('any_email@mail.com', 'any_password')
    expect(promisse).rejects.toThrow(new InvalidParamError('loadUseByEmailRepository'))
  })

  test('Should return null if LoadUseByEmailRepository an invalid email is provided', async () => {
    const { sut, loadUseByEmailRepositorySpy } = makeSut()
    loadUseByEmailRepositorySpy.user = null
    const accessToken = await sut.auth('invalid_email@mail.com', 'any_password')
    expect(accessToken).toBeNull()
  })

  test('Should return null if LoadUseByEmailRepository an invalid password is provided', async () => {
    const { sut, encripterSpy } = makeSut()
    encripterSpy.isValid = false
    const accessToken = await sut.auth('any_email@mail.com', 'invalid_password')
    expect(accessToken).toBeNull()
  })

  test('Should call EncrypterHelper with correct values', async () => {
    const { sut, loadUseByEmailRepositorySpy, encripterSpy } = makeSut()
    await sut.auth('invalid_email@mail.com', 'any_password')
    expect(encripterSpy.password).toBe('any_password')
    expect(encripterSpy.hashedPassword).toBe(loadUseByEmailRepositorySpy.user.password)
  })

  test('Should call TokenGenerator with correct userId', async () => {
    const { sut, loadUseByEmailRepositorySpy, tokenGeneratorSpy } = makeSut()
    await sut.auth('valid_email@mail.com', 'valid_password')
    expect(tokenGeneratorSpy.userId).toBe(loadUseByEmailRepositorySpy.user.id)
  })
})
