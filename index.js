'use strict'

const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const docusignComplete = require('./hooks/docusignComplete')

const app = express()
app.use('/docusignComplete', docusignComplete)

exports.hooks = app