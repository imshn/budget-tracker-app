// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;

http.createServer((req, res) => {
  const url = req.url;
  const filePath = path.join(__dirname, url);
  if(url=="/"){
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.createReadStream('./index.html').pipe(res);
    return;  // End the request handling after sending the HTML file
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('404 Not Found');
      } else {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('500 Internal Server Error');
      }
    } else {
      const mimeType = getMimeType(filePath);
      res.writeHead(200, {'Content-Type': mimeType});
      res.end(data);
    }
  });
}).listen(port, () => {
  console.log(`Server running on port ${port}`);
});

function getMimeType(filePath) {
  const ext = path.extname(filePath);
  switch (ext) {
    case '.html':
      return 'text/html';
    case '.css':
      return 'text/css';
    case '.js':
      return 'application/javascript';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    default:
      return 'application/octet-stream';
  }
}