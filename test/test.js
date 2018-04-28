const Host = require('../src/host');

(function(Host) {

    // POC
    Host.newEndpoint('/target', 200, {"message": "hi {{name1}}, I am {{name2}}"}, null, 'POST');

    Host.newEndpoint('/target', 200, {"message": "This is a test for {{method}}"}, null, 'GET');

})(Host);
