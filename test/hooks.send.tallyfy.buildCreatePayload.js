const chai = require('chai');

const { expect } = chai;
const { buildCreatePayload } = require('../hooks/send/tallyfy');

const docusignParsed = require('./fixtures/docusignParsed');

const process = {
  checklistTitle: 'Checklist title',
  checklistId: 'checklistid123456789',
  docusignTemplates: ['template1', 'template2'],
  uploadLogoStepId: 'uploadlogostepid0987654321',
  uploadLogoStepAlias: 'logoalias-99',
  preloadFields: {
    organization: 'preloadfield-org',
    partnershipLevel: 'preloadfield-level',
    primaryContactName: 'preloadfield-name',
    primaryContactEmail: 'preloadfield-email',
    event: 'preloadfield-event',
  },
};

let builtPayload = {};
builtPayload = buildCreatePayload(docusignParsed, process);

describe(`hooks.send.tallyfy.buildCreatePayload`, function() {
  describe(`correctly build payload for Tallyfy run create`, function() {
    it(`Created Payload is not undefined`, function() {
      expect(builtPayload).not.to.be.undefined;
    });

    describe(`No built fields are undefined`, function() {
      Object.keys(builtPayload).forEach(key => {
        it(`property ${key} is defined`, function() {
          expect(builtPayload[key]).not.be.undefined;
        });
      });

      if (builtPayload.prerun) {
        Object.keys(builtPayload.prerun).forEach(key => {
          it(`prerun property ${key} is defined`, function() {
            expect(builtPayload.prerun[key]).not.be.undefined;
          });
        });
      }
    });
  });
});
