import "dotenv/config"
import nunjucks from "nunjucks"
import express, { Router } from "express"
import pool from "./db.js"
import morgan from "morgan"
import bodyParser from "body-parser"

const app = express()
const port = 3000

app.use(morgan("dev"))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

nunjucks.configure("views", {
    autoescape: true,
    express: app,
})

app.use(express.static("views/css"))

app.post('/species', async (req, res) => {
    const { name, latin, wingspan_min, wingspan_max } = req.body
    const [result] = await pool.promise().query('INSERT INTO species (name, latin, wingspan_min, wingspan_max) VALUES (?, ?, ?, ?)', [name, latin, wingspan_min, wingspan_max])
    res.redirect("/species")
})

app.get('/species', async (req, res) => {
    const [species] = await pool.promise().query(
        `SELECT species.* FROM species;`,
    )
    console.log("species: " + species)
    res.render("species.njk", {
        species: species,
    })
})

app.get("/species/new", async (req, res) => {
    const [species] = await pool.promise().query(
        'SELECT * FROM species'
    )
    res.render("species_form.njk", { 
        species 
    })
})

app.get("/species/:id", async (req, res) => {
    const [species] = await pool.promise().query(
        `SELECT species.* FROM species WHERE species.id = ?;`,
        [req.params.id],
    )
    res.render("specie.njk", {
        species: species[0]
    })
})

app.post('/birds', async (req, res) => {
    console.log(req.body)
    const { name, wingspan, species_id } = req.body
  
    const [result] = await pool.promise().query('INSERT INTO birds (name, wingspan, species_id) VALUES (?, ?, ?)', [name, wingspan, species_id])
  
    res.redirect("/birds")
  })

app.get("/birds", async (req, res) => {
    const [birds] = await pool.promise().query(
        `SELECT birds.*, species.name AS species FROM birds 
        JOIN species ON birds.species_id = species.id;`,
    )
    res.render("birds.njk", {
        birds: birds,
    })
})

app.get('/birds/new', async (req, res) => {
    const [species] = await pool.promise().query('SELECT * FROM species')
  
    res.render('birds_form.njk', { 
        species
    })
})

app.get("/birds/:id", async (req, res) => {
    const [bird] = await pool.promise().query(
        `SELECT birds.*, species.name AS species 
      FROM birds 
      JOIN species ON birds.species_id = species.id WHERE birds.id = ?;`,
        [req.params.id],
    )
    res.render("bird.njk", {
        bird: bird[0]
    })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})