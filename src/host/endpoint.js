module.exports = function(app, Logger, config) {

    const httpMethods = { GET: 'GET', POST: 'POST', PUT: 'PUT' };

    const PLACEHOLDER_PATTERN = /\${[A-Za-z]{1,}[A-Za-z0-9]*}/g;

    const PLACEHOLDER_RULE = /[A-Za-z]{1,}[A-Za-z0-9]*/;


    function Endpoint(target, status, body, headers, method) {
        this.listenTarget = target;
        this.listenMethod = method;
        this.status = status;
        this.body = body;
        this.headers = headers;
        this.variables = {};
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
        let _this = this;
        app.get(this.listenTarget, (req, res) => _this.respond(req, res));
    };

    function acceptRequest(req, res) {
        return new Promise((resolve, reject) => {
            resolve({req: req, res: res});
        });
    }

    Endpoint.prototype.listenPost = function () {
        app.post(this.listenTarget, (req, res) => this.respond(req, res));
    };

    Endpoint.prototype.respond = function (req, res) {
        let _this = this;
        acceptRequest(req, res)
                            .then(request => _this.processRequest(request))
                            .then(request => _this.setResStatus(request))
                            .then(request => _this.setResHeaders(request))
                            .then(request => _this.setResBody(request))
                            .then(request => _this.send(request))
                            .catch(err => {
                                Logger.error(err);
                            })
    };

    Endpoint.prototype.processRequest = function (request) {
        this.registerVariables(request.req);
        return request;
    };

    Endpoint.prototype.registerVariables = function (req) {
        let json = req.body;
        for (let key in json) {
            this.setVariable[key] = json[key];
        }
        return req;
    };

    Endpoint.prototype.setResStatus = function (request) {
        request.status = this.status;
        return request;
    };

    Endpoint.prototype.setResHeaders = function (request) {
        if (this.headers != null) {
            Logger.log(`Headers: ${JSON.stringify(this.headers)}`);
            request.headers = this.headers;
        }
        return request;
    };

    Endpoint.prototype.setResBody = function (request) {
        if (this.body == null) return request;
        let bodyStr = JSON.stringify(this.body);
        let matches = matchPatterns(bodyStr, PLACEHOLDER_PATTERN);
        for(let match of matches)
            bodyStr = bodyStr.replace(match, this.evaluatePlaceholder(match));
        request.body = parseJSON(bodyStr);
        return request;
    };

    Endpoint.prototype.send = function (request) {
        let resBody = request.body != null ? request.body : '';
        Logger.log(`Status: ${request.status}`);
        Logger.log(`Body: ${JSON.stringify(resBody)}`);
        request.res.status(request.status).send(resBody);
        return request;
    };

    Endpoint.prototype.evaluatePlaceholder = function (str) {
        let key = matchPatterns(str, PLACEHOLDER_RULE);
        return this.variables[key[0]];
    };

    function preparePromise(obj) {
        return new Promise((resolve, reject) => {
            resolve(obj);
        });
    };

    function matchPatterns(str, pattern) {
        let regexp = new RegExp(pattern);
        return str.match(regexp);
    }

    function parseJSON(str) {
        return JSON.parse(str);
    }


    // ============== Accessors & Mutators ==============

    Endpoint.prototype.setVariable = function (key, value) {
        this.variables[key] = value;
    };

    Endpoint.prototype.getVariable = function () {
        return this.variables;
    };

    Endpoint.prototype.setBody = function (bodyJson) {
        this.body = bodyJson;
    };

    return Endpoint;
};
