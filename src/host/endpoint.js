module.exports = function(app, Logger, config) {

    // Supported http methods
    const httpMethods = { GET: 'GET', POST: 'POST' };

    // Regular expression used to identify placeholders
    const PLACEHOLDER_PATTERN = /\{{[A-Za-z]{1,}[A-Za-z0-9]*}}/g;

    // Regular expression pattern representing placeholder naming rules used to
    // identify the variable name
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

        if (this.listenMethod === httpMethods.POST) {
            this.listenPost();
        }
        else if (this.listenMethod === httpMethods.GET) {
            this.listenGet();
        }
        else {
            throw new Error(`Unsupported http method: "${this.listenMethod}".`);
        }
    };

    Endpoint.prototype.listenGet = function () {
        let _this = this;
        app.get(this.listenTarget, (req, res) => _this.respond(req, res));
    };

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
            .then(request => _this.sendResponse(request))
            .then(request => _this.cleanup())
            .catch(err => {
                Logger.error(err);
            });
    };

    Endpoint.prototype.processRequest = function (request) {
        this.registerVariables(request.req);
        return request;
    };

    /**
     * Register key-value pairs found in the request headers and body
     * @author Jianhao Xu (Chris)
     * @date   2018-04-28
     * @param  {[type]}   req [description]
     * @return {[type]}
     */
    Endpoint.prototype.registerVariables = function (req) {
        let headers = req.headers,
            body = req.body;
        // Register fields in headers
        for (let key in headers)
            this.setVariable(key, headers[key]);
        // Register fields in body
        for (let key in body)
            this.setVariable(key, body[key]);
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
        for(let match of matches) {
            let val = this.evaluatePlaceholder(match);
            // Do not replace if the placeholder cannot be evaluated
            if (val != null) bodyStr = bodyStr.replace(match, val);
        }
        request.body = parseJSON(bodyStr);
        return request;
    };

    /**
     * Send out the response
     * @author Jianhao Xu (Chris)
     * @date   2018-04-28
     * @param  {[type]}   request [description]
     * @return {[type]}
     */
    Endpoint.prototype.sendResponse = function (request) {
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

    /**
     * Clean up registered variable values
     * @author Jianhao Xu (Chris)
     * @date   2018-04-28
     * @return {[type]}
     */
    Endpoint.prototype.cleanup = function () {
        this.variables = {};
    };

    function acceptRequest(req, res) {
        return new Promise((resolve, reject) => {
            resolve({req: req, res: res});
        });
    }

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
