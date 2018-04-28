const express = require('express');
const bodyParser = require('body-parser');
const EndpointFactory = require('./endpoint');
const config = require('../common/config');
const app = express();
const Endpoint = EndpointFactory(app, console, config);

app.use(bodyParser.json());

module.exports = (function (app, Endpoint, Logger, config) {

    const PORT = config.port;

    let server = app.listen(PORT, () => {
        Logger.log(`Start listening on port ${PORT}!`);
    });

    function newEndpoint(target, status, body, headers, method) {
        let endpoint = new Endpoint(target, status, body, headers, method);
        endpoint.listen();
        return endpoint;
    }

    function destroy() {
        server.close();
    }

    return {
        newEndpoint: newEndpoint,
        destroy: destroy
    };

})(app, Endpoint, console, config);
