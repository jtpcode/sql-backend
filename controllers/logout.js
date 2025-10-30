const router = require('express').Router()
const { tokenExtractor, userFinder } = require('../util/middleware')

router.delete('/', tokenExtractor, userFinder, async (req, res) => {
  await req.session.destroy()
  
  res.status(204).end()
})

module.exports = router