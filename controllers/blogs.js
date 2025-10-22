const jwt = require('jsonwebtoken')
const { SECRET } = require('../util/config')
const router = require('express').Router()
const { Op } = require('sequelize')

const { Blog, User } = require('../models')

const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      console.log(authorization.substring(7))
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
    } catch (error){
      console.log(error)
      return res.status(401).json({ error: 'token invalid' })
    }
  } else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}

const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id)
  next()
}

const userFinder = async (req, res, next) => {
  req.user = await User.findByPk(req.decodedToken.id)
  next()
}

router.get('/', async (req, res) => {
  const where = {}

  if (req.query.search) {
    where.title = {
      [Op.substring]: req.query.search
    }
  }

  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['name']
    },
    where
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