const core = require('./restcore');
const http = require('http');
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
	});
});

core.addAPI('/', 'put', (query, res, req) => {
	res.end();
})