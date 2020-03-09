const http = require('http');
const fs = require('fs');
const port = 80;
const { parse } = require('querystring');
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

const serverListener = (req, res) => {
	let urlc = req.url;
	let url = urlc.split('?')[0];
	let urlsp = url.split('/');
	let query = parse(urlc.split('?')[1]);

	if (urlsp[1] === 'setIP') {
		if (urlsp[2] !== authToken){
			res.writeHead(403, 'Authorization failed: Invalid token');
			res.end();
			return;
		}
		if (query["ip"] === undefined || !isIP(query["ip"])) {
			res.writeHead(400, 'Invalid IP');
			res.end();
			return;
		}
		if (query["service"] === undefined) {
			res.writeHead(400, 'Missing service');
			res.end();
			return;
		}
		var service = services[query["service"]];
		if (service === undefined) {
			res.writeHead(400, 'Inexistant service');
			res.end();
			return;
		}

		service['ip'] = query["ip"];
	} else if (urlsp.length > 1) {
		var service = services[urlsp[1]];
		if (service === undefined) {
			res.writeHead(400, 'Unregistered service');
			res.end()
			return;
		}
	}
}

console.log(authToken);
