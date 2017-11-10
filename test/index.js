const ident = require('../../wot-identity')
const serialize = require('../')
const test = require('tape')

test('save and load a user to/from disk', t => {
  const pass = 'aesrntearsntearstn'
  ident.createUser(pass, {name: 'pb'}, function (err, user) {
    if (err) throw err
    serialize.saveUser(user, '/tmp/uzr', function (err) {
      if (err) throw err
      serialize.loadUser(pass, '/tmp/uzr', function (err, loadedUser) {
        if (err) throw err
        t.deepEqual(loadedUser.signKeys.sk_plain, user.signKeys.sk_plain, 'decrypts the correct signing secret key')
        t.deepEqual(loadedUser.boxKeys.sk_plain, user.boxKeys.sk_plain, 'decrypts the correct box secret key')
        t.deepEqual(loadedUser.signKeys.sk_encrypted, user.signKeys.sk_encrypted, 'loads sign encrypted secret key')
        t.deepEqual(loadedUser.boxKeys.sk_encrypted, user.boxKeys.sk_encrypted, 'loads box encrypted secret key')
        t.deepEqual(loadedUser.signKeys.pk, user.signKeys.pk, 'loads sign pub key')
        t.deepEqual(loadedUser.boxKeys.pk, user.boxKeys.pk, 'loads box pub key')
        t.deepEqual(loadedUser.cert, user.cert, 'loads cert')
        t.deepEqual(loadedUser.salt, user.salt, 'loads salt')
        t.end()
      })
    })
  })
})

test('cant load with invalid pass', t => {
  const pass = 'aesrntearsntearstn'
  ident.createUser(pass, {name: 'pb'}, function (err, user) {
    if (err) throw err
    serialize.saveUser(user, '/tmp/uzr', function (err) {
      if (err) throw err
      serialize.loadUser(pass + 'x', '/tmp/uzr', function (err, loadedUser) {
        t.assert(err instanceof Error, 'throws error for invalid pass')
        t.end()
      })
    })
  })
})
