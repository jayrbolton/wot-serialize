const parallel = require('run-parallel')
const path = require('path')
const fs = require('fs-extra')
const crypto = require('../wot-crypto') // TODO

const serialize = module.exports = {}

// Given a user (created with wot-identity), save to disk (dont save plain secret keys)
serialize.saveUser = function saveUser (user, dir, callback) {
  dir = path.resolve(dir)
  fs.ensureDir(dir)

  parallel([
    (cb) => fs.writeFile(dir + '/imprint', user.imprint, cb),
    (cb) => fs.writeFile(dir + '/stamp', user.stamp_locked, 'utf8', cb),
    (cb) => fs.writeFile(dir + '/lock', user.lock, cb),
    (cb) => fs.writeFile(dir + '/key', user.key_locked, 'utf8', cb),
    (cb) => fs.writeFile(dir + '/cert', user.cert, cb),
    (cb) => fs.writeFile(dir + '/salt', user._salt, cb)
  ], (err) => {
    callback(err)
  })
}

serialize.loadUser = function loadUser (pass, dir, callback) {
  dir = path.resolve(dir)
  parallel([
    (cb) => fs.readFile(dir + '/imprint', cb),
    (cb) => fs.readFile(dir + '/stamp', 'utf8', cb),
    (cb) => fs.readFile(dir + '/lock', cb),
    (cb) => fs.readFile(dir + '/key', 'utf8', cb),
    (cb) => fs.readFile(dir + '/cert', cb),
    (cb) => fs.readFile(dir + '/salt', cb)
  ], (err, results) => {
    if (err) return callback(err)
    setupUser(results, pass, callback)
  })
}

// Create a user object whose properties match a user created by wot-identity
// `results` is an array of file data from the parallel reads from loadUser
function setupUser (results, pass, callback) {
  const imprint = results[0]
  const stampLocked = results[1]
  const lock = results[2]
  const keyLocked = results[3]
  const cert = results[4]
  const salt = results[5]
  crypto.hashPass(pass, salt, function (err, pwhash) {
    if (err) return callback(err)
    var stamp, key
    try {
      stamp = crypto.decrypt(pwhash.secret, stampLocked)
      key = crypto.decrypt(pwhash.secret, keyLocked)
    } catch (err) {
      if (err) return callback(err)
    }
    const user = {
      imprint: imprint,
      stamp: Buffer.from(stamp, 'hex'),
      stamp_locked: stampLocked,
      lock: lock,
      key: Buffer.from(key, 'hex'),
      key_locked: keyLocked,
      cert: cert,
      _salt: salt
    }
    callback(null, user)
  })
}
