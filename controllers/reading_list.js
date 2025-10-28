const router = require('express').Router()
const { User, Blog, ReadingList } = require('../models')

router.post('/', async (req, res) => {
  const { blog_id, user_id } = req.body
  try {
    const readingList = await ReadingList.create({ blog_id, user_id })
    res.status(201).json(readingList)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

module.exports = router