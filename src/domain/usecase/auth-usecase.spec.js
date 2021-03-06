const { MissingParamError } = require('../../Utils/errors')
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

const makeEncripterWithError = () => {
  class EncripterSpy {
    async compare () {
      throw new Error()
    }
  }
  return new EncripterSpy()
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

const makeTokenGeneratorWithError = () => {
  class TokenGeneratorSpy {
    async generate (userId) {
      throw new Error()
    }
  }
  return new TokenGeneratorSpy()
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

const makeUpdateAccessTokenRepository = () => {
  class UpdateAccessTokenRepositorySpy {
    async update (userId, accessToken) {
      this.userId = userId
      this.accessToken = accessToken
    }
  }
  return new UpdateAccessTokenRepositorySpy()
}

const makeUpdateAccessTokenRepositoryWithError = () => {
  class UpdateAccessTokenRepositorySpy {
    async update (userId, accessToken) {
      throw new Error()
    }
  }
  return new UpdateAccessTokenRepositorySpy()
}

const makeLoadUseByEmailRepositoryWithError = () => {
  class LoadUseByEmailRepositorySpy {
    async load () {
      throw new Error()
    }
  }
  return new LoadUseByEmailRepositorySpy()
}

const makeSut = () => {
  const tokenGeneratorSpy = makeTokenGenerator()
  const encripterSpy = makeEncripter()
  const loadUseByEmailRepositorySpy = makeLoadUseByEmailRepository()
  const updateAccessTokenRepositorySpy = makeUpdateAccessTokenRepository()
  const sut = new AuthUseCase({
    loadUseByEmailRepository: loadUseByEmailRepositorySpy,
    encripter: encripterSpy,
    tokenGenerator: tokenGeneratorSpy,
    updateAccessTokenRepository: updateAccessTokenRepositorySpy
  })
  return { sut, loadUseByEmailRepositorySpy, encripterSpy, tokenGeneratorSpy, updateAccessTokenRepositorySpy }
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

  test('Should return an accessToken if correct credentials are provided', async () => {
    const { sut, tokenGeneratorSpy } = makeSut()
    const accessToken = await sut.auth('valid_email@mail.com', 'valid_password')
    expect(accessToken).toBe(tokenGeneratorSpy.accessToken)
    expect(accessToken).toBeTruthy()
  })

  test('Should call UpdateAccessTokenRepository with correct values', async () => {
    const { sut, loadUseByEmailRepositorySpy, tokenGeneratorSpy, updateAccessTokenRepositorySpy } = makeSut()
    await sut.auth('valid_email@mail.com', 'valid_password')
    expect(updateAccessTokenRepositorySpy.userId).toBe(loadUseByEmailRepositorySpy.user.id)
    expect(updateAccessTokenRepositorySpy.accessToken).toBe(tokenGeneratorSpy.accessToken)
  })

  test('Should throw if invalid dependency is provided', async () => {
    const invalid = {}
    const loadUseByEmailRepository = makeLoadUseByEmailRepository()
    const encripter = makeEncripter()
    const tokenGenerator = makeTokenGenerator()
    const suts = [].concat(
      new AuthUseCase(),
      new AuthUseCase({}),
      new AuthUseCase(),
      new AuthUseCase({
        loadUseByEmailRepository: invalid
      }),
      new AuthUseCase({
        loadUseByEmailRepository
      }),
      new AuthUseCase({
        loadUseByEmailRepository,
        encripter
      }),
      new AuthUseCase({
        loadUseByEmailRepository,
        encripter,
        tokenGenerator: invalid
      }),
      new AuthUseCase({
        loadUseByEmailRepository,
        encripter,
        tokenGenerator
      }),
      new AuthUseCase({
        loadUseByEmailRepository,
        encripter,
        tokenGenerator,
        updateAccessTokenRepository: invalid
      })
    )
    for (const sut of suts) {
      const promisse = sut.auth('any_email@mail.com', 'any_password')
      expect(promisse).rejects.toThrow()
    }
  })

  test('Should throw if dependency throws', async () => {
    const loadUseByEmailRepository = makeLoadUseByEmailRepository()
    const encripter = makeEncripter()
    const tokenGenerator = makeTokenGenerator()
    const suts = [].concat(
      new AuthUseCase({
        loadUseByEmailRepository: makeLoadUseByEmailRepositoryWithError()
      }),
      new AuthUseCase({
        loadUseByEmailRepository,
        encripter: makeEncripterWithError()
      }),
      new AuthUseCase({
        loadUseByEmailRepository,
        encripter,
        tokenGenerator: makeTokenGeneratorWithError()
      }),
      new AuthUseCase({
        loadUseByEmailRepository,
        encripter,
        tokenGenerator,
        updateAccessTokenRepository: makeUpdateAccessTokenRepositoryWithError()
      })
    )
    for (const sut of suts) {
      const promisse = sut.auth('any_email@mail.com', 'any_password')
      expect(promisse).rejects.toThrow()
    }
  })
})
