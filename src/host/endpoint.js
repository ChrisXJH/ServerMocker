module.exports = function(app, Logger, config) {

    const httpMethods = { GET: 'GET', POST: 'POST', PUT: 'PUT' };

    const placeholderPattern = config.placeholderPattern;

    function Endpoint(target, status, body, headers, method) {
        this.listenTarget = target;
        this.listenMethod = method;
        this.status = status;
        this.body = body;
        this.headers = headers;
        this.placeholders = {};
    }

    Endpoint.prototype.listen = function () {
        Logger.log(`Start accepting ${this.listenMethod} requests on target "${this.listenTarget}"`);
        switch(this.listenMethod) {
            case httpMethods.POST:
            this.listenPost();
            break;

            case httpMethods.GET:
            default:
            this.listenGet();
        }
    };

    Endpoint.prototype.listenGet = function () {
        app.get(this.listenTarget, (req, res) => this.respond(req, res));
    };

    Endpoint.prototype.listenPost = function () {
        app.post(this.listenTarget, (req, res) => this.respond(req, res));
    };

    Endpoint.prototype.respond = function (req, res) {
        this.prepareResponse(res)
            .then((res) => this.setHeaders(res))
            .then((res) => this.processBody(res))
            .then((res) => this.send(res));
    };

    Endpoint.prototype.prepareResponse = function (res) {
        Logger.log(`Responding to request ${this.listenMethod}: ${this.listenTarget}`);
        return new Promise((resolve, reject) => {
            resolve(res);
        });
    };

    Endpoint.prototype.setHeaders = function (res) {
        if (this.headers != null) {
            Logger.log(`Headers: ${JSON.stringify(this.headers)}`);
            res.set(this.headers);
        }
        return res;
    };

    Endpoint.prototype.processBody = function (res) {
        // TODO: Use regex to replace placeholders with actual values in body
        return res;
    };

    Endpoint.prototype.send = function (res) {
        let resBody = this.body != null ? this.body : '';
        Logger.log(`Status: ${this.status}`);
        Logger.log(`Body: ${resBody}`);
        res.status(this.status).send(resBody);
        return res;
    };


    // ============== Accessors & Mutators ==============

    Endpoint.prototype.setPlaceHolder = function (key, value) {
        this.placeholders[key] = value;
    };

    Endpoint.prototype.getPlaceHolders = function () {
        return this.placeholders;
    };

    return Endpoint;
};
