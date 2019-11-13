const dotenv = require('dotenv');

dotenv.config();
const express = require('express');
const { auth } = require('./mw/auth');
const docusignComplete = require('./hooks/receive/docusignComplete');

const app = express();
app.use(auth);
app.use('/docusignComplete', docusignComplete);

exports.hooks = app;
