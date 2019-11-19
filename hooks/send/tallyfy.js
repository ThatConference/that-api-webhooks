const Sentry = require('@sentry/node');
const axios = require('axios');
const tallyfyProcesses = require('../../data/tallyfyProcesses.json');

const tallyfyIds = {};
tallyfyIds.isMissingData = false;
if (process.env.TALLYFY_ORG_ID && process.env.TALLYFY_API_BASE && process.env.TALLYFY_ACCESS_TOKEN) {
  tallyfyIds.orgId = process.env.TALLYFY_ORG_ID;
  tallyfyIds.apiBase = process.env.TALLYFY_API_BASE;
  tallyfyIds.accessToken = process.env.TALLYFY_ACCESS_TOKEN;
} else {
  tallyfyIds.isMissingData = true;
}

// Can only add 1 guest at this time
const updateStepPayload = {
  owners: {
    guests: [''],
  },
};

const sendTallyfy = {
  send: docusign => {
    if (tallyfyIds.isMissingData) {
      console.error(`Missing environment variable data for TallyFy`);
      return undefined;
    }
    // locate Tallyfy process
    const process = tallyfyProcesses.find(p => {
      return p.docusignTemplates.includes(docusign.templateName);
    });
    if (!process) {
      return undefined;
    }
    // build create payload
    const createRunPayload = sendTallyfy.buildCreatePayload(docusign, process);
    // Create run at Tallyfy
    return sendTallyfy.createRun(createRunPayload).then(result => {
      if (!result) {
        return undefined;
      }
      const rdata = JSON.parse(result.data);
      // build put payload
      updateStepPayload.owners[0] = docusign.primaryContactEmail;
      const uri = `${tallyfyIds.apiBase}/organizations/${tallyfyIds.orgId}/runs/${rdata.run_id}/tasks/${process.uploadLogoStepid}`;
      return sendTallyfy.updateTask(uri).then(taskResult => {
        return {
          process: createRunPayload.name,
          summary: createRunPayload.summary,
          runId: result.id,
          checklist_id: result.checklist_id,
          stepRunId: taskResult.run_id,
          createdAt: result.created_at,
        };
      });
    });
  },
  buildCreatePayload: (docusign, process) => {
    const payload = { prerun: {} };
    payload.name = `${docusign.organization} - ${docusign.event} ${docusign.eventYear}`;
    payload.checklist_id = process.checklistId;
    payload.summary = `${docusign.organization} Onboarding Process ${docusign.event} ${docusign.eventYear}`;
    payload.prerun[process.preloadFields.organization] = docusign.organization;
    payload.prerun[process.preloadFields.partnershipLevel] = {
      id: 0,
      text: docusign.partnerLevel,
    };
    payload.prerun[process.preloadFields.primaryContactName] = docusign.fullName;
    payload.prerun[process.preloadFields.primaryContactEmail] = docusign.email;
    payload.prerun[process.preloadFields.event] = docusign.event;
    return payload;
  },
  createRun: postPayload => {
    const uri = `${tallyfyIds.apiBase}/organizations/${tallyfyIds.orgId}/runs`;
    return axios
      .post(uri, postPayload)
      .then(result => {
        if (result.status < 200 || result.status > 299) {
          console.error(`Issue sending hook to Tallyfy. Status: ${result.status}`);
          Sentry.captureMessage(`Issue sending hook to Tallyfy:\n${result}`);
          return undefined;
        }
        return result;
      })
      .catch(err => {
        console.error(`Exception sending hook to tally:\n${err}`);
        Sentry.captureException(err);
        return undefined;
      });
  },
  updateTask: uri => {
    return axios
      .put(uri, updateStepPayload)
      .then(result => {
        if (result.status < 200 || result.status > 299) {
          console.error(`Issue sending PUT to tallyfy. status: ${result.status}`);
          Sentry.captureMessage(`Issue sending PUT to tallyfy: ${result}`);
          return {};
        }
        return result;
      })
      .catch(err => {
        console.error(`Exception sending put to Tallyfy:\n${err}`);
        Sentry.captureException(err);
        return {};
      });
  },
};

module.exports = sendTallyfy;
