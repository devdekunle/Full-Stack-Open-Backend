import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Person from './models/person.js'

dotenv.config()
const uri = process.env.MONGODB_URI
const PORT = process.env.PORT || 5000

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body' ))

mongoose.set('strictQuery', false)
mongoose.connect(uri)
  .then(() => {
    console.log('Connected to MONGODB')
  })
  .catch(() => {
    console.log('Error connecting to Mongodb Atlas')
  })

const errorHandler = (error, req, res, next) => {
  if (error.name === 'CastError') {
    res.status(400).send({ error: 'Malformatted Id' })
  }
  if (error.name === 'ValidationError') {
    res.status(400).json({ error: error.message })
  }
  next(error)
}

app.get('/api/persons', async (req, res) => {
  try {
    const persons = await Person.find({})
    return res.status(200).json(persons)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

app.get('/info', async (req, res) => {
  const date = Date()
  res.status(200).send(`<p>Phonebook has info for ${ await Person.find({}).length} people</p>
        <p>${date}</p>
        `)
})
app.get('/api/persons/:id', async (req, res, next) => {
  try {
    const _id = req.params.id
    if (!_id) {
      return res.status(400).json({ 'error': 'id missing' })
    }

    const existingPerson = await Person.findById(_id).exec()
    if (existingPerson) return res.status(200).json(existingPerson)
    else {
      return res.status(404).json({ error: 'Person not found in Phonebook' })
    }
  } catch (error) {
    console.log('Error fetching person from Phonebook', error.message)
    next(error)
  }
})

app.put('/api/persons/:id', async (req, res, next) => {

  const _id = req.params.id
  if (!_id) res.status(400).json({ error: 'id missing' })

  const body = req.body
  if (!body) res.status(400).json({ error: 'body missing' })
  try {
    const updatedNumber = await Person.findByIdAndUpdate(_id,
      { number: body.number },
      { new: true, runValidators: true, context: 'query' })
    if (!updatedNumber) {
      res.status(404).json({ error: 'Contact not found' })
    }
    res.status(200).json(updatedNumber)
  } catch(error) {
    console.log('Error Updating Contact', error.message)
    next(error)
  }
})

app.delete('/api/persons/:id', async (req, res, next) => {
  const _id = req.params.id
  if (!_id) return res.status(400).json({ 'error' : 'id missing' })
  try {
    await Person.deleteOne({ _id })
    return res.status(204).end()
  } catch (err) {
    console.log('Error deleting contact')
    next(err)
  }
})

app.post('/api/persons', async (req, res, next) => {
  if (!req.body) return res.status(400).json({ 'error': 'request body is missing' })
  const { name, number } = req.body
  if (!name) return res.status(400).json({ 'error': 'name is missing' })
  if (!number) return res.status(400).json({ 'error': 'number is missing' })
  try {
    const existingPerson = await Person.findOne({ name })
    if (existingPerson) {
      return res.status(400).json({ error: 'Contact already exists in Phonebook' })
    }
    const person = new Person({
      name,
      number,
      date: new Date()
    })
    const returnedPerson = await person.save()
    return res.status(201).json(returnedPerson)
  } catch (err) {
    console.log('Error Fetching Phonebook', err.message)
    next(err)
  }
})

app.use(errorHandler)
app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`)
})