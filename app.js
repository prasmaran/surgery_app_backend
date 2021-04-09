const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const { urlencoded } = require('body-parser')

const app = express()
const port = process.env.PORT || 5000

app.use(bodyParser.urlencoded({ extended : false}))

app.use(bodyParser.json())

// MySQL

// Listen on PORT
app.listen(port, () => console.log(` Sever listenining on port ${port}...`))