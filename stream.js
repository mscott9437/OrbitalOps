const http = require('node:http');

const host = '127.0.0.1';
const port = 3000;

http
.createServer((req, res) => {
   const { headers, method, url } = req;
   let body = [];
   req
   .on('error', err => {
      console.error(err);
   })
   .on('data', chunk => {
      body.push(chunk);
   })
   .on('end', () => {
      body = Buffer.concat(body).toString();
      // BEGINNING OF NEW STUFF

      res.on('error', err => {
         console.error(err);
      });

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      // Note: the 2 lines above could be replaced with this next one:
      // res.writeHead(200, {'Content-Type': 'application/json'})

      const responseBody = { headers, method, url, body };

      res.write(JSON.stringify(responseBody));
      res.end();
      // Note: the 2 lines above could be replaced with this next one:
      // res.end(JSON.stringify(responseBody))

      // END OF NEW STUFF
   });
})
.listen(port, host, () => {
   console.log(`Server running at ws://${host}:${port}`);
});

