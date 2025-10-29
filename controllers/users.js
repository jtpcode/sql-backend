const bcrypt = require('bcrypt')
const router = require('express').Router()
const { User, Blog, ReadingList } = require('../models')

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
    attributes: ['name', 'username'],
    include: {
      model: Blog,
      as: 'readings',
      attributes: ['id', 'url', 'title', 'author', 'likes', 'year'],
      through: { attributes: [] },
      include: {
        model: ReadingList,
        attributes: ['read', 'id']
      }
    }
  })
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  res.json(user)
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