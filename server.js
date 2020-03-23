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

	if (urlsp[1] === 'setip') {
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
		if (services === undefined) {
			res.writeHead(400, 'Inexistant service');
			res.end();
			return;
		}

		services['ip'] = query["ip"];
		res.writeHead(200, {'content-type': 'text/plain'});
		res.end('Succesfully set ip to ' + query["ip"]);
	} else if (urlsp.length > 1) {
		var service = services[urlsp[1]];
		if (service === undefined) {
			res.writeHead(400, 'Unregistered service');
			res.end()
			return;
		}
		var fURL = urlsp.slice(2);
		var options = {
			hostname: services['ip'],
			port: 80,
			path: fURL,
			method: req.method,
			headers: req.headers
		};

		var proxy = http.request(options, (pres) => {
			res.writeHead(pres.statusCode, pres.headers);
			pres.pipe(res, {
				end: true
			});
		});

		proxy.on('error', () => {
			console.log("error");
		});

		res.pipe(proxy, {
			end:true
		});

		res.on('error', (err) => {
			res.writeHead(500, 'Internal Error');
			res.end('500: An internal error occured and the server is unable to serve this request');
		})
	}
}

var server = http.createServer(serverListener);

server.on('close', () => {
	fs.writeFileSync('services.json', JSON.stringify(services));
});

process.on('SIGINT', function() {
  server.close();
});

server.listen(80);

console.log(authToken);
