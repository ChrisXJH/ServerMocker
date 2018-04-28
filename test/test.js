let assert = require('assert');
const Host = require('../src/host');
describe('ServerMocker', function() {
    describe('newEndpoint', function() {
        it('should successfully create new post/get endpoints.', function() {
            try {
                Host.newEndpoint('/target1', 200, {"message": "Hello world!"}, {"Content-Type" : "application/json"}, 'POST');
                Host.newEndpoint('/target1', 200, {"message": "Hello world!"}, {"Content-Type" : "application/json"}, 'GET');
            } catch (e) {
                assert.fail("Exception occurred while creating new endpoints.");
            }
        });

        it('should successfully create new endpoint without null body or null headers', function() {
            try {
                Host.newEndpoint('/target2', 200, null, {"Content-Type" : "application/json"}, 'POST');
                Host.newEndpoint('/target2', 200, {"message": "Hello world!"}, null, 'GET');
            } catch (e) {
                assert.fail("Exception occurred while creating new endpoints.");
            }
        });

        it('should successfully create new endpoint without null body and null headers', function() {
            try {
                Host.newEndpoint('/target3', 200, null, null, 'POST');
                Host.newEndpoint('/get3', 200, null, null, 'GET');
            } catch (e) {
                assert.fail("Exception occurred while creating new endpoints.");
            }
        });

        it('fail to create endpoint for unknown method', function() {
            let passed = false;
            try {
                Host.newEndpoint('/target3', 200, null, null, 'POS');
            } catch (e) {
                passed = true;
            } finally {
                if (!passed) assert.fail('Expected exception did not occur for unknown http method.');
            }
        });

        it('close the mock server', function() {
            try {
                Host.destroy();
            } catch (e) {
                assert.fail('Exception occurred while trying to destory the mock server: ' + e)
            }
        });


    });
});
