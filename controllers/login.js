const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const router = require('express').Router()
const { User, Session } = require('../models/')
const { SECRET } = require('../util/config')

router.post('/', async (req, res) => {
  const { username, password } = req.body

  const user = await User.findOne({
    where: {
      username: username
    }
  })

  if (!user || user.disabled) {
    return res.status(401).json({ 
      error: 'invalid username or password' 
    })
  }

  const passwordCorrect = await bcrypt.compare(password, user.passwordHash)

  if (!passwordCorrect) {
    return res.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    username: user.username,
    id: user.id,
  }

  const token = jwt.sign(userForToken, SECRET)
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await Session.create({
    userId: user.id,
    tokenHash,
    expiresAt
  })

  res.status(200).send({ 
    token, 
    username: user.username, 
    name: user.name 
  })
})

module.exports = router