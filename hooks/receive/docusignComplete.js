// Catch completed docusign webhook
const axios = require('axios');
const Sentry = require('@sentry/node');
const { parseDocuSignXml } = require('../../parsers/docuSign');

Sentry.init({ dsn: process.env.SENTRY_NODE_DSN });

module.exports = (req, res) => {
  console.log('trigger docusignComplete');
  let payload = [];
  if (req.method === 'POST') {
    console.log('post');
    if (req.body) {
      usePayload(req.body, res);
    } else {
      req
        .on('error', err => {
          console.error(err);
        })
        .on('data', chunk => {
          console.log('data event');
          payload.push(chunk);
        })
        .on('end', () => {
          console.log('end event');
          payload = Buffer.concat(payload).toString();
          usePayload(payload, res);
        });
    }
  } else {
    console.error(`Non POST request, ${req.method}`);
    Sentry.captureMessage(`Non POST request, ${req.method}`, 'warning');
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.write(`What was that? I didn't like that much.`);
    res.end();
  }
};

const usePayload = (payload, res) => {
  parseDocuSignXml(payload)
    .then(docusign => {
      if (!docusign) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write('Unknown DocuSign template, skipping. See log for details');
        res.end();
        return;
      }
      axios
        .post(process.env.ZAP_DOCUSIGN_IN_HOOK_URL, docusign)
        .then(axresp => {
          console.log(`axios res status ${axresp.status}`);
          if (axresp.status < 200 || axresp.status > 299) {
            console.error(`Issue sending hook. status ${axresp.status}`);
            Sentry.captureMessage(`Issue sending webhook request: ${axresp}`);
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.write(JSON.stringify(docusign));
          res.end();
        })
        .catch(err => {
          console.error(err);
          Sentry.captureException(err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.write(err.message);
          res.end();
        });
    })
    .catch(err => {
      console.error(err);
      res.end();
    });
};
