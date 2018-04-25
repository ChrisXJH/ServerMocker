const Host = require('../src/host');

(function(Host) {

    // POC
    let endpoint = Host.newEndpoint('/target', 200, {"message": "hi ${name1}, I am ${name2}"}, null, 'GET');
    endpoint.setVariable('name1', 'Chris');
    endpoint.setVariable('name2', 'Kevin');

})(Host);
