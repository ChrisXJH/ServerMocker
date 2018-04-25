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
        app.get(this.listenTarget, (req, res) => this.respond(req, res));
    };

    Endpoint.prototype.listenPost = function () {
        app.post(this.listenTarget, (req, res) => this.respond(req, res));
    };

    Endpoint.prototype.respond = function (req, res) {
        Logger.log(`Responding to request ${this.listenMethod}: ${this.listenTarget}`);
        preparePromise(res)
            .then((res) => this.setHeaders(res))
            .then((res) => this.processBody(res))
            .then((res) => this.send(res))
            .catch(err => {
                Logger.error(err);
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
        if (this.body == null) return res;
        let bodyStr = JSON.stringify(this.body);
        let matches = matchPatterns(bodyStr, PLACEHOLDER_PATTERN);
        for(let match of matches)
            bodyStr = bodyStr.replace(match, this.evaluatePlaceholder(match));
        this.body = parseJSON(bodyStr);
        return res;
    };

    Endpoint.prototype.send = function (res) {
        let resBody = this.body != null ? this.body : '';
        Logger.log(`Status: ${this.status}`);
        Logger.log(`Body: ${JSON.stringify(resBody)}`);
        res.status(this.status).send(resBody);
        return res;
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
