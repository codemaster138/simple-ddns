const core = require('./restcore');
const http = require('http');
const fs = require('fs');
const makeid = (length) => { // Dirtily place funtions in server.js
   var result           = '';
   var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
};

const isIP = (ipaddress) => {  // Dirty oncemore ^
  if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {  
    return true;  
  }
  return false;  
}; 
const authToken = makeid(128);

var services = JSON.parse(fs.readFileSync('services.json'));

core.init({
	debug: true,
	port: process.env.PORT
});

core.addAPI('/', 'get', (query, res, req) => {
	core.debug('got request:' + req.url);
	var options = {
		hostname: services['ip'],
		port: 80,
		path: req.url,
		method: req.method,
		headers: req.headers
	};
	
	var proxy = http.request(options, (pres) => {
		res.writeHead(pres.statusCode, pres.headers);
		pres.pipe(res, {
			end: true
		});
		core.debug(`proxy responded with:\n ${pres.read()}`);
	});

	req.pipe(proxy, {
		end: true
	});
});

core.addAPI('/ip', 'post', (query, res, req) => {
	console.log('received post');
	if (!query.ip || !isIP(query.ip)) {
		res.writeHead(400, { 'content-type': 'application/json' });
		res.end(`{"status": 400, "causes": ["Not an IP"]}`);
		return;
	}
	services.ip = query.ip;
	res.writeHead(200, { 'content-type': 'application/json' });
	res.end(`{"status": 200}`);
	console.log('IP is now ' + query.ip);
})