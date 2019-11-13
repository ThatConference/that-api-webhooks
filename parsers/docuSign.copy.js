'use strict'

const xml2js = require('xml2js')

const parseDocuSignXml = (docusignXml) => {

    return xml2js.parseStringPromise(docusignXml, {explicitArray: false, mergeAttrs: true})
    .then((result) => {
        return parseDocuSign(result)
    }).catch(err => {
        console.error(`error in parseDocuSignXml ${err}`)
        //return err
    })

}

const parseDocuSign = (docusignObj) => {

  const envlStatus = docusignObj.DocuSignEnvelopeInformation.EnvelopeStatus
  const rstatus = docusignObj.DocuSignEnvelopeInformation.EnvelopeStatus.RecipientStatuses.RecipientStatus
  const du = {
      extraFormFields: '',
  } // docusign object

  // Receipent values
  du.type = rstatus.Type
  du.email = rstatus.Email
  du.username = rstatus.UserName
  du.sent = rstatus.Sent
  du.delivered = rstatus.delivered
  du.signed = rstatus.Signed
  du.status = rstatus.status

  const formdata = rstatus.FormData.xfdf.fields.field
  for (let i = 0; i < formdata.length; i++) {
      const f = formdata[i]
      switch(f.name) {
          case 'Radio Group e57d8e73-bed2-4588-8218-7c89aa04cf5a':
              du.radioGroup = f.value
              break
          case 'Dropdown 58cab66b-5588-43c1-9dbe-317f8d53b50e':
              du.dropdown = f.value
              break
          case 'Company':
              du.company = f.value
              break
          case 'DateSigned':
              du.dateSigned = f.value
              break
          default:
              du.extraFormFields += `${f.value}\n`
      } 

  }

  // Envelope values
  du.envelopeId = envlStatus.EnvelopeID
  du.senderUserName = envlStatus.UserName
  du.senderEmail = envlStatus.Email
  du.templateName = envlStatus.DocumentStatuses.DocumentStatus.TemplateName

  return du
}

module.exports = {
  parseDocuSignXml
}