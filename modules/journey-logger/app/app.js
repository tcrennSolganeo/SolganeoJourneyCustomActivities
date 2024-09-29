// JOURNEY BUILDER CUSTOM ACTIVITY - journey-logger ACTIVITY
// ````````````````````````````````````````````````````````````
// SERVER SIDE IMPLEMENTATION
//
// This example demonstrates
// * Configuration Lifecycle Events
//    - save
//    - publish
//    - validate
// * Execution Lifecycle Events
//    - execute
//    - stop

const express = require('express');
const axios = require('axios');
import { jwtDecode } from 'jwt-decode';
/*const jwtDecode = require('jwt-decode');*/
const configJSON = require('../config/config-json');

// setup the journey-logger app
module.exports = function journeyLogger(app, options) {
    const moduleDirectory = `${options.rootDirectory}/modules/journey-logger`;
    const sfmcApiClientId = process.env.clientId;
    const sfmcApiClientSecret = process.env.clientSecret;
    const sfmcApiDataExtensionKey = 'Journey_Logger';
    const sfmcApiSubdomain = process.env.subdomain;
    let sfmcApiToken = null;

    // setup static resources
    app.use('/modules/journey-logger/dist', express.static(`${moduleDirectory}/dist`));
    app.use('/modules/journey-logger/images', express.static(`${moduleDirectory}/images`));
    app.use('/modules/journey-logger/styles', express.static(`${moduleDirectory}/styles`));

    // setup the index redirect
    app.get('/modules/journey-logger/', function(req, res) {
        return res.redirect('/modules/journey-logger/index.html');
    });

    // setup index.html route
    app.get('/modules/journey-logger/index.html', function(req, res) {
        // you can use your favorite templating library to generate your html file.
        // this example keeps things simple and just returns a static file
        return res.sendFile(`${moduleDirectory}/html/index.html`);
    });

    // setup config.json route
    app.get('/modules/journey-logger/config.json', function(req, res) {
        // Journey Builder looks for config.json when the canvas loads.
        // We'll dynamically generate the config object with a function
        return res.status(200).json(configJSON(req));
    });

    app.get('/modules/journey-logger/checkDataExtensionSetup', function(req, res) {
        console.log('checkDataExtensionSetup');
        return res.status(200).json({status: 'OK'});
    });

    // ```````````````````````````````````````````````````````
    // BEGIN JOURNEY BUILDER LIFECYCLE EVENTS
    //
    // CONFIGURATION
    // ```````````````````````````````````````````````````````
    // Reference:
    // https://developer.salesforce.com/docs/atlas.en-us.mc-apis.meta/mc-apis/interaction-operating-states.htm

    /**
     * Called when a journey is saving the activity.
     * @return {[type]}     [description]
     * 200 - Return a 200 iff the configuraiton is valid.
     * 30x - Return if the configuration is invalid (this will block the publish phase)
     * 40x - Return if the configuration is invalid (this will block the publish phase)
     * 50x - Return if the configuration is invalid (this will block the publish phase)
     */
    app.post('/modules/journey-logger/save', function(req, res) {
        console.log('debug: /modules/journey-logger/save');
        return res.status(200).json({});
    });

    /**
     * Called when a Journey has been published.
     * This is when a journey is being activiated and eligible for contacts
     * to be processed.
     * @return {[type]}     [description]
     * 200 - Return a 200 iff the configuraiton is valid.
     * 30x - Return if the configuration is invalid (this will block the publish phase)
     * 40x - Return if the configuration is invalid (this will block the publish phase)
     * 50x - Return if the configuration is invalid (this will block the publish phase)
     */
    app.post('/modules/journey-logger/publish', function(req, res) {
        console.log('debug: /modules/journey-logger/publish');
        return res.status(200).json({});
    });

    /**
     * Called when Journey Builder wants you to validate the configuration
     * to ensure the configuration is valid.
     * @return {[type]}
     * 200 - Return a 200 iff the configuraiton is valid.
     * 30x - Return if the configuration is invalid (this will block the publish phase)
     * 40x - Return if the configuration is invalid (this will block the publish phase)
     * 50x - Return if the configuration is invalid (this will block the publish phase)
     */
    app.post('/modules/journey-logger/validate', function(req, res) {
        console.log('debug: /modules/journey-logger/validate');
        return res.status(200).json({});
    });


    // ```````````````````````````````````````````````````````
    // BEGIN JOURNEY BUILDER LIFECYCLE EVENTS
    //
    // EXECUTING JOURNEY
    // ```````````````````````````````````````````````````````

    /**
     * Called when a Journey is stopped.
     * @return {[type]}
     */
    app.post('/modules/journey-logger/stop', function(req, res) {
        console.log('debug: /modules/journey-logger/stop');
        return res.status(200).json({});
    });

    /**
     * Called when a contact is flowing through the Journey.
     * @return {[type]}
     * 200 - Processed OK
     * 3xx - Contact is ejected from the Journey.
     * 4xx - Contact is ejected from the Journey.
     * 5xx - Contact is ejected from the Journey.
     */
    app.post('/modules/journey-logger/execute', async function(req, res) {
        console.log('debug: /modules/journey-logger/execute');

        const request = req.body;

        console.log(" req.body", JSON.stringify(req.body));

        // Find the in argument
        function getInArgument(k) {
            if (request && request.inArguments) {
                for (let i = 0; i < request.inArguments.length; i++) {
                    let e = request.inArguments[i];
                    if (k in e) {
                        return e[k];
                    }
                }
            }
        }

        const contactkeyInArgument = getInArgument('contactKey');
        const journeyDefinitionIdInArgument = getInArgument('journeyDefinitionId');
        const journeyVersionInArgument = getInArgument('journeyVersion');
        const journeyIdInArgument = getInArgument('journeyId');
        const journeyNameInArgument = getInArgument('journeyName');
        const labelInArgument = getInArgument('label');

        console.log('contactkeyInArgument', contactkeyInArgument);
        console.log('journeyDefinitionIdInArgument', journeyDefinitionIdInArgument);
        console.log('journeyVersionInArgument', journeyVersionInArgument);
        console.log('journeyIdInArgument', journeyIdInArgument);
        console.log('journeyNameInArgument', journeyNameInArgument);
        console.log('labelInArgument', labelInArgument);

        const authEndpoint = 'https://'+sfmcApiSubdomain+'.auth.marketingcloudapis.com/v2/token';
        const dataExtensionEndpoint = 'https://'+sfmcApiSubdomain+'.rest.marketingcloudapis.com/data/v1/async/dataextensions/key:'+sfmcApiDataExtensionKey+'/rows';
        
        try {

            if(isSfmcApiTokenExpired(sfmcApiToken)) {
                getSfmcApiToken();
            }

            const decodedToken = jwtDecode(sfmcApiToken);
            console.log("decodedToken", JSON.stringify(decodedToken));
            /*if(!sfmcApiToken) {
                getSfmcApiToken();
            }*/

            const data = {
                'items': [
                    {
                        'ContactKey': contactkeyInArgument,
                        'Label': labelInArgument,
                        'Journey Definition Id': journeyDefinitionIdInArgument,
                        'Journey Version': journeyVersionInArgument,
                        'Journey Name': journeyNameInArgument
                    }
                ],
            };

            const dataExtensionResponse = await axios.post(dataExtensionEndpoint, data, {
                headers: {
                    'Authorization': `Bearer ${sfmcApiToken}`,
                    'Content-Type': 'application/json',
                },
            });

            // example: https://developer.salesforce.com/docs/atlas.en-us.noversion.mc-app-development.meta/mc-app-development/example-rest-activity.htm
            const responseObject = {
                label: labelInArgument,
                data: dataExtensionResponse.data
            };
    
            console.log('Response Object', JSON.stringify(responseObject));
    
            return res.status(200).json(responseObject);

        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({ error: 'An error occurred' });
        }

    });


    function isSfmcApiTokenExpired(token) {
        if (!token) return true;
        try {
            const decodedToken = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            return decodedToken.exp < currentTime;
        } catch (error) {
            console.error('Error decoding token:', error);
            return true;
        }
    }

    async function getSfmcApiToken() {
        const authEndpoint = 'https://'+sfmcApiSubdomain+'.auth.marketingcloudapis.com/v2/token';
        const authResponse = await axios.post(authEndpoint, {
            grant_type: 'client_credentials',
            client_id: sfmcApiClientId,
            client_secret: sfmcApiClientSecret
        });
        sfmcApiToken = authResponse.data.access_token;
        return sfmcApiToken;
    }

};