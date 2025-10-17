const express = require('express')
const app = express()

const { PORT } = require('./util/config')
const { connectToDatabase } = require('./util/db')

const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

app.use(express.json())
app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

// Virheenkäsittely: express versio 5+ automaattisesti käsittelee async/await virheet
app.use((err, req, res, next) => {
  console.error(err)

  if (err.message === 'Validation error: Validation isEmail on username failed') {
    return res.status(400).json({ error: 'Invalid email format for username' })
  }

  res.status(500).json({ error: err.message })
})

const start = async () => {
  await connectToDatabase()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()