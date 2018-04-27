const Host = require('../src/host');

(function(Host) {

    // POC
    let endpoint = Host.newEndpoint('/target', 200, {"message": "hi ${name1}, I am ${name2}"}, null, 'POST');

})(Host);
