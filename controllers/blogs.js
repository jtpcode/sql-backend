const router = require('express').Router()
const { Op } = require('sequelize')

const { Blog, User } = require('../models')
const { tokenExtractor, userFinder, blogFinder } = require('../util/middleware')

router.get('/', async (req, res) => {
  const where = {}

  if (req.query.search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${req.query.search}%` } },
      { author: { [Op.iLike]: `%${req.query.search}%` } }
    ]
  }

  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['name']
    },
    where,
    order: [['likes', 'DESC']]
  })
  console.log(JSON.stringify(blogs, null, 2))
  
  res.json(blogs)
})

router.post('/', tokenExtractor, userFinder, async (req, res) => {
  const blog = await Blog.create({...req.body, userId: req.user.id})

  res.json(blog)
})

router.get('/:id', blogFinder, async (req, res) => {
  const blog = req.blog
  if (blog) {
    console.log(blog.toJSON())
    res.json(blog)
  } else {
    res.status(404).end()
  }
})

router.delete('/:id', blogFinder, tokenExtractor, userFinder, async (req, res) => {
  const blog = req.blog
  if (blog) {
    if (blog.userId === req.user.id) {
      await blog.destroy()
      res.status(204).end()
    } else {
      return res.status(403).json({ error: 'forbidden: user cannot delete this blog' })
    }
  } else {
    res.status(404).end()
  }
})

router.put('/:id', blogFinder, async (req, res) => {
  const blog = req.blog
  if (blog) {
    blog.likes = Number(blog.likes) + 1
    await blog.save()
    res.json(blog)
  } else {
    res.status(404).end()
  }
})

module.exports = router