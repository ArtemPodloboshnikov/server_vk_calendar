let restify = require('restify');
let cors = require('cors');
const fs = require('fs')
const fileContents = fs.readFileSync('./data.json', 'utf8');


function getData(req, res, next) {
  try {
    const data = JSON.parse(fileContents)
    console.log(data);
    res.send((req.params.date == 'all')?JSON.stringify(data):JSON.stringify(data[req.params.date]));
  } catch(err) {
    console.error(err)
  }
  next();
}
function setData(req, res, next) {
    try {
      let data = JSON.parse(fileContents);
      data[req.params.date] = Object.keys(req.body)[0].split('.');
      fs.writeFileSync('./data.json', JSON.stringify(data))
      res.statusCode(200);
    } catch(err) {
      console.error(err)
      res.statusCode(500)
    }
    next();
  }
function getPage(req, res, next) {
  const page = fs.readFileSync('./index.html')
  res.writeHead(200, {
    'Content-Length': Buffer.byteLength(page),
    'Content-Type': 'text/html'
  });
  res.write(page)
  res.end();
  next()
}
let server = restify.createServer();
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser({ mapParams: true }));
server.use(cors())
server.get('/data/:date', getData);
server.get('/index.html', getPage);
server.post('/data/:date', setData);
// server.head('/set-data/:date', getData);

server.listen(process.env.PORT || 8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});