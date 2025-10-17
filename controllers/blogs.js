const jwt = require('jsonwebtoken')
const { SECRET } = require('../util/config')
const router = require('express').Router()
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

router.get('/', async (req, res) => {
  const blogs = await Blog.findAll({
    attributes: { exclude: ['userId'] },
    include: {
      model: User,
      attributes: ['name']
    }
  })
  console.log(JSON.stringify(blogs, null, 2))
  
  res.json(blogs)
})

router.post('/', tokenExtractor, async (req, res) => {
  const user = await User.findByPk(req.decodedToken.id)
  const blog = await Blog.create({...req.body, userId: user.id})

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

router.delete('/:id', blogFinder, async (req, res) => {
  const blog = req.blog
  if (blog) {
    await blog.destroy()
    res.status(204).end()
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