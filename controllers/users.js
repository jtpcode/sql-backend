const bcrypt = require('bcrypt')
const router = require('express').Router()
const { User, Blog } = require('../models')

router.get('/', async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['passwordHash'] },
    include: {
      model: Blog,
      attributes: { exclude: ['userId'] }
    }
  })

  res.json(users)
})

router.post('/', async (req, res) => {
  const { username, name, password } = req.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = await User.create({
    username,
    name,
    passwordHash,
  })

  res.status(201).json(user)
})

router.get('/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['passwordHash'] }
  })
  if (user) {
    res.json(user)
  } else {
    res.status(404).end()
  }
})

// Username vaihtaminen
router.put('/:username', async (req, res) => {
  const { username } = req.params
  const { newName } = req.body

  const user = await User.findOne({ where: { username } })
  if (!user) {
    return res.status(404).end()
  }

  user.name = newName
  await user.save()

  res.json(user)
})

module.exports = router