const http = require('http');
const { parse } = require('querystring');

const C = {
    port: 8080,
    dodebug: false,

    init: function (options) {
        this.port = options.port ? options.port : this.port;
        this.dodebug = options.debug ? options.debug : this.dodebug;
        this.server.listen(this.port);
        console.log(`Listening on port ${this.port}`);
        this.dsep();
    },

    API: {},

    addAPI: function (path, method, handler) {
        this.API[path] = {};
        this.API[path][method] = handler;
        this.debug("API is ", this.API);
    },

    debug: function (...str) {
        if (this.dodebug) {
            for (s of str) {
                console.log(s);
            }
        }
    },

    dsep: function () {
        if (this.dodebug) console.log("===============================================");
    },
    
    server: http.createServer((req, res) => {
        let self = C;
        var url = req.url;
        var iurl = url.split('?')[0];
        self.debug(`Full URL: ${url}\nURL location: ${iurl}`);
        var query;
        if (req.method.toUpperCase() === 'GET') {
            if (url.split('?').length > 1) {
                query = url.split('?').splice(1, 1).toString();
                query = parse(query);
            }

            if (query) {
                if (self.API[iurl] && self.API[iurl].get) {
                    self.API[iurl]["get"](query, res, req);
                } else {
                    self.debug("Wrong API path: ", iurl);
                    res.writeHead(400, { 'content-type': 'application/json' });
                    res.end(`{"status": 400, "causes": ["missing/incorrect API path: get"]}`);
                }
            } else {
                self.debug("No query");
                res.writeHead(400, { 'content-type': 'application/json' });
                res.end(`{"status": 400, "causes": ["missing query"]}`);
            }
        }
        if (req.method.toUpperCase() === 'POST') {
            var body = "";
            req.on('data', chunk => {
                body += chunk;
            });

            req.on('end', () => {
                var query = parse(body);
                if (query) {
                    if (self.API[iurl] && self.API[iurl].post) {
                        self.API[iurl]["post"](query, res, req);
                    } else {
                        self.debug("Wrong API path");
                        res.writeHead(400, { 'content-type': 'application/json' });
                        res.end(`{"status": 400, "causes": ["missing/incorrect API path: post"]}`);
                    }
                } else {
                    self.debug("No query");
                    res.writeHead(400, { 'content-type': 'application/json' });
                    res.end(`{"status": 400, "causes": ["missing query"]}`);
                }
            });
        }

        if (req.method.toUpperCase() === 'DELETE') {
            if (iurl.split('/').length > 2) {
                if (self.API['/' + iurl.split('/')[1]] && self.API['/' + iurl.split('/')[1]].delete) {
                    var q = iurl.split('/');
                    q.splice(1, 1);
                    query = q.join('/').substr(1);
                    query = decodeURIComponent(query);
                    self.API['/' + iurl.split('/')[1]]["delete"](query, res, req);
                } else {
                    self.debug("Wrong API path");
                    res.writeHead(400, { 'content-type': 'application/json' });
                    res.end(`{"status": 400, "causes": ["missing/incorrect API path: del"]}`);
                }
            } else {
                self.debug("No query");
                res.writeHead(400, { 'content-type': 'application/json' });
                res.end(`{"status": 400, "causes": ["missing query"]}`);
            }
        }
    })
}

if (module.exports !== undefined) module.exports = C;