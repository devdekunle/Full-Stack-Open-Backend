import mongoose from 'mongoose'

mongoose.set('strictQuery', false)

const name = process.argv[3]
const password = process.argv[2]
const number = process.argv[4]

const url = `mongodb+srv://Devdekunle:${password}@cluster0.xhywp.mongodb.net/PhonebookApp?retryWrites=true&w=majority&appName=Cluster0`
mongoose.connect(url)
const personSchema = mongoose.Schema({
  name: String,
  number: String,

})

const Person = mongoose.model('Person', personSchema)
// return all entries in the phonebook
if (process.argv.length === 3) {
  Person.find({})
    .then(result => {
      console.log('Phonebook:')
      result.forEach(person => {
        console.log(person.name, person.number)
      })
      mongoose.connection.close()
    })
} else {
// Add a new entry in the phonebook
  const person = new Person({
    name,
    number
  })

  person.save().then(result => {
    console.log(`added ${result.name} number ${result.number} to Phonebook`)
    mongoose.connection.close()
  })
}