module.exports = function configJSON(req) {
  return {
    workflowApiVersion: '1.1',
    metaData: {
      // the location of our icon file
      icon: `images/icon.svg`,
      category: 'customer'
    },
    // For Custom Activity this must say, "REST"
    type: 'REST',
    lang: {
      'en-US': {
        name: 'Journey Logger',
        description: 'Log the fact the a Contact went throught this activity on a Data Extension'
      }
    },
    arguments: {
      execute: {
        // See: https://developer.salesforce.com/docs/atlas.en-us.mc-apis.meta/mc-apis/how-data-binding-works.htm
        inArguments: [
          {
            contactKey: '{{Contact.Key}}',
            journeyDefinitionId: '{{Context.DefinitionId}}',
            journeyVersion: '{{Context.VersionNumber}}',
            journeyId: '',
            journeyName: '',
            label: ''
          }
        ],
        outArguments: [],
        // Fill in the host with the host that this is running on.
        // It must run under HTTPS
        url: `https://${req.headers.host}/modules/journey-logger/execute`,
        // The amount of time we want Journey Builder to wait before cancel the request. Default is 60000, Minimal is 1000
        timeout: 10000,
        // how many retrys if the request failed with 5xx error or network error. default is 0
        retryCount: 3,
        // wait in ms between retry.
        retryDelay: 1000,
        // The number of concurrent requests Journey Builder will send all together
        concurrentRequests: 5
      }
    },
    configurationArguments: {
      publish: {
        url: `https://${req.headers.host}/modules/journey-logger/publish`
      },
      validate: {
        url: `https://${req.headers.host}/modules/journey-logger/validate`
      },
      stop: {
        url: `https://${req.headers.host}/modules/journey-logger/stop`
      }
    },
    userInterfaces: {
      configurationSupportsReadOnlyMode : true,
      configInspector: {
        size: 'scm-md',
        emptyIframe: true
      }
    },
    schema: {
      arguments: {
        execute: {
          inArguments: [],
          outArguments: [{
            label: {
              dataType: 'Text',
              direction: 'out',
              access: 'visible'
            },
            data: {
              dataType: 'Text',
              direction: 'out',
              access: 'visible'
            }
          }]
        }
      }
    }
  };
};
