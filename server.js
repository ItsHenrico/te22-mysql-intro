import "dotenv/config"
import nunjucks from "nunjucks"
import express, { Router } from "express"
import pool from "./db.js"

const app = express()
const port = 3000

nunjucks.configure("views", {
    autoescape: true,
    express: app,
})

app.use(express.static("css"))

app.post('/species', async (req, res) => {
    const { name, latin, wingspan_min, wingspan_max } = req.body

    const [result] = await pool.promise().query('INSERT INTO species (name, latin, wingspan_min, wingspan_max) VALUES (?, ?, ?, ?)', [name, latin, wingspan_min, wingspan_max])

    res.json(result)
    res.redirect('/species')
})

app.get('/species', async (req, res) => {
    const [species] = await pool.promise().query(
        `SELECT species.*, species.name AS species FROM birds 
        JOIN species ON birds.species_id = species.id;`,
    )
    console.log(species)
    res.render("species.njk"), {
        species: species
    }
})

app.get('/species/new', async (req, res) => {
    const [species] = await pool.promise().query('SELECT * FROM species')

    res.render('species_form.njk', { species })
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

    res.render('birdQuery.njk', {
        species,
        name: "name"
    })
})

app.post('/birds', async (req, res) => {
    const { name, wingspan, species_id } = req.body

    const [result] = await pool.promise().query('INSERT INTO birds (name, wingspan, species_id) VALUES (?, ?, ?)', [name, wingspan, species_id])

    res.json(result)
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