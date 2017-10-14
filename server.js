const fs = require('fs'),
	http = require('http'),
	port = 3000
let serve = (fileName, contentType, res) => {
	fs.readFile(fileName, 'utf8', (err, data) => {
		if (err) {
			res.writeHead(404, {
				'Content-type': 'text/plain'
			});
			res.write('Page Was Not Found');
			res.end();
		}
		res.writeHead(200, {
			'Content-type': contentType
		});
		res.write(data);
		res.end();
	})
}
http.createServer((req, res) => {
	(req.url === '/sigma.min.js') ?
		serve('sigma.min.js', 'text/javascript', res) :
	(req.url === '/simrank.js') ?
		serve('simrank.js', 'text/javascript', res) :
	(req.url === '/jquery.min.js') ?
		serve('jquery.min.js', 'text/javascript', res) :
	(req.url === '/style.css') ?
		serve('style.css', 'text/css', res) :
	(req.url === '/data.txt') ?
		serve('data.txt', 'text/plain', res) :
	serve('index.html', 'text/html', res);
}).listen(port, (err) => {
	if (err) {
		return console.log('mala tempora currunt', err)
	}
	console.log(`server is listening on ${port}`)
});