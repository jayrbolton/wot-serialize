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
    (cb) => fs.writeFile(dir + '/sign_pk', user.signKeys.pk, cb),
    (cb) => fs.writeFile(dir + '/sign_sk', user.signKeys.sk_encrypted, 'utf8', cb),
    (cb) => fs.writeFile(dir + '/box_pk', user.boxKeys.pk, cb),
    (cb) => fs.writeFile(dir + '/box_sk', user.boxKeys.sk_encrypted, 'utf8', cb),
    (cb) => fs.writeFile(dir + '/cert', user.cert, cb),
    (cb) => fs.writeFile(dir + '/salt', user.salt, cb)
  ], (err) => {
    callback(err)
  })
}

serialize.loadUser = function loadUser (pass, dir, callback) {
  dir = path.resolve(dir)
  parallel([
    (cb) => fs.readFile(dir + '/sign_pk', cb),
    (cb) => fs.readFile(dir + '/sign_sk', 'utf8', cb),
    (cb) => fs.readFile(dir + '/box_pk', cb),
    (cb) => fs.readFile(dir + '/box_sk', 'utf8', cb),
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
  const signPk = results[0]
  const signSk = results[1]
  const boxPk = results[2]
  const boxSk = results[3]
  const cert = results[4]
  const salt = results[5]
  crypto.hashPass(pass, salt, function (err, pwhash) {
    if (err) return callback(err)
    var signSkPlain, boxSkPlain
    try {
      signSkPlain = crypto.decrypt(pwhash.secret, signSk)
      boxSkPlain = crypto.decrypt(pwhash.secret, boxSk)
    } catch (err) {
      if (err) return callback(err)
    }
    const user = {
      signKeys: {
        pk: signPk,
        sk_encrypted: signSk,
        sk_plain: Buffer.from(signSkPlain, 'hex')
      },
      boxKeys: {
        pk: boxPk,
        sk_encrypted: boxSk,
        sk_plain: Buffer.from(boxSkPlain, 'hex')
      },
      cert: cert,
      salt: salt
    }
    callback(null, user)
  })
}
