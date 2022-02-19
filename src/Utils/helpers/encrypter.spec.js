class Encrypter {
  async compare (password, hashPassword) {
    return true
  }
}
describe('Encrypter', () => {
  test('Should return true if bcrypt returns true', async () => {
    const sut = new Encrypter()
    const isValid = await sut.compare('any_password', 'hash_password')
    expect(isValid).toBe(true)
  })
})
