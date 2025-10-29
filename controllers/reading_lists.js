const router = require('express').Router()
const { ReadingList } = require('../models')
const { tokenExtractor, userFinder } = require('../util/middleware')

router.post('/', async (req, res) => {
  const { blogId, userId } = req.body
  try {
    const readingList = await ReadingList.create({ blogId, userId })
    res.status(201).json(readingList)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.put('/:id', tokenExtractor, userFinder, async (req, res) => {
  const { read } = req.body
  const readingList = await ReadingList.findByPk(req.params.id)
  if (!readingList) {
    return res.status(404).json({ error: 'ReadingList entry not found' })
  }

  if (readingList.userId !== req.user.id) {
    return res.status(403).json({ error: 'forbidden: user cannot modify this reading list entry' })
  }

  readingList.read = read
  await readingList.save()
  res.json(readingList)
})

module.exports = router