const express = require('express');
const EndpointFactory = require('./endpoint');
const config = require('../common/config');
const app = express();
const Endpoint = EndpointFactory(app, console, config);


module.exports = (function (app, Endpoint, Logger, config) {

    const PORT = config.port;

    Logger.log(`Start listening on port ${PORT}!`);
    app.listen(PORT);

    function newEndpoint(target, status, body, headers, method) {
        let endpoint = new Endpoint(target, status, body, headers, method);
        endpoint.listen();
        return endpoint;
    }

    return {
        newEndpoint: newEndpoint
    };

})(app, Endpoint, console, config);
