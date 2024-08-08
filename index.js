import express from "express"
import cors from "cors"
import morgan from "morgan"

const app = express();

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('body', (req, res) => {
    return JSON.stringify(req.body);
});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body' ))

const PORT = 3000
let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
];

app.get("/api/persons", (req, res) => {
    res.status(200).json(persons);
})

app.get("/info", (req, res) => {
    const date = Date()
    res.status(200).send(`<p>Phonebook has info for ${persons.length} people</p>
        <p>${date}</p>
        `);
})
app.get("/api/persons/:id", (req, res) => {
    const id = req.params.id;
    if (!id) {
        res.status(400).json({"error": "id missing"})
    }
    const person =  persons.find(person => person.id === id);
    !person ? res.status(404).json({"error": "Person does not exist"}) : res.status(200).json(person);

});

app.delete("/api/persons/:id", (req, res) => {
    const id = req.params.id;
    if (!id) return res.status(400).json({"error" : "id missing"});
    persons = persons.filter(person => person.id !== id);
    res.status(204).end()
});

app.post("/api/persons", (req, res) => {
    const body = req.body
    if (!body) return res.status(400).json({"error": "request body is missing"});
    if (!body.name) return res.status(400).json({"error": "name is missing"});
    if (!body.number) return res.status(400).json({"error": "number is missing"});

    const existingPerson = persons.find(person => person.name === body.name);
    if (existingPerson) return res.status(400).json({"error": `${body.name} already exists in Phonebook`});
    const newPerson = {
        id: Math.floor(Math.random() * 1000000),
        name: body.name,
        number: body.number
    }
    persons = persons.concat(newPerson)
    res.status(201).json(newPerson);
})
app.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}`);
});