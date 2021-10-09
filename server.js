let restify = require('restify');
let cors = require('cors');
const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const url_data = 'https://json.extendsclass.com/bin/67d94baa7657';

async function updateQuery(data)
{
  try
  {

    let response = await fetch(url_data, {
      method: 'PUT',
      headers:
      {
        'Content-Type': 'application/json',
        "Security-key": '777'
      },
      body: JSON.stringify(data)
    })
    console.log(await response.json())
  }
  catch(error)
  {
    console.log(error)
  }
} 
async function getQuery()
{
  try {
    const data = await fetch(url_data);
    // const fileContents = fs.readFileSync('./data.json', 'utf8');
    // const data = JSON.parse(fileContents)
    // res.send((req.params.date == 'all')?JSON.stringify(data):JSON.stringify(data[req.params.date]));
    const json = await data.json();
    return json;
   
  } catch(err) {
    console.error(err)
  }
}
async function getData(req, res, next) {
  const data = await getQuery();
  res.send(JSON.stringify(data))
  next();
}
async function deleteData(req, res, next)
{
  // const fileContents = fs.readFileSync('./data.json', 'utf8');
  // let data = JSON.parse(fileContents);
  let data = await getQuery();

  let new_data = [];
  for (let i = 0; i < data[req.params.date].length; i++)
  {
    const current_time = Object.keys(data[req.params.date][i])[0];
    if (req.body.time !== current_time)
    {

      new_data.push({[current_time]: data[req.params.date][i][current_time]});
      // delete data[req.params.date][i][req.body.time];
      // break;
    }
  }
  data[req.params.date] = new_data;
  console.log(data);
  new_data = {};
  for (let date in data)
  {
    if (data[date].length != 0)
      new_data[date] = [...data[date]]
  }
  data = new_data;
  console.log(data)
  updateQuery(data)
  // fs.writeFileSync('./data.json', JSON.stringify(data))
  res.send(JSON.stringify(data));

  next();
}
async function setData(req, res, next) {
    try {

      // const fileContents = fs.readFileSync('./data.json', 'utf8');
      // let data = JSON.parse(fileContents);
      const data = await getQuery();
      console.log(data)
      // console.log(req.params)
      // console.log(req.body)
      if (req.params.time === undefined)
      {
        // console.log(req.body)
        data[req.params.date] = req.body[req.params.date];
        // console.log(data)
      }
      else
      {
        // console.log(data);
        let buf_data = data[req.params.date];
        for (let i = 0; i < buf_data.length; i++)
        {
          if (Object.keys(buf_data[i])[0] == req.params.time)
          {
            buf_data[i] = {};
            buf_data[i][req.params.time] = req.body[req.params.time]
          }
        }
      }

      // fs.writeFileSync('./data.json', JSON.stringify(data))
      updateQuery(data);
      res.send(JSON.stringify(data));

    } catch(err) {
      console.error(err)
      res.status(500)
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
server.get('/data/all', getData);
server.get('/index', getPage);
server.put('/data/:date/:time', setData);
server.post('/data/:date', setData);
server.del('/data/:date', deleteData);
// server.head('/set-data/:date', getData);

server.listen(process.env.PORT || 80, function() {
  console.log('%s listening at %s', server.name, server.url);
});