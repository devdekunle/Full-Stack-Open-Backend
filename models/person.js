import { mongoose, Schema } from 'mongoose'

const personSchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 3
  },
  number: {
    type: String,
    validate: {
      validator: function(v) {
        return /\d{2,3}-\d{6,9}/.test(v)
      },
      message: props => `${props.value} is not a valid phone number!`,
      required: [true, 'User phone number required']
    }
  },
  date: Date
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Person = mongoose.model('Person', personSchema)
export default Person
