var fs      = require('fs')
  , net     = require('net')
  , http    = require('http')
  , express = require('express')

var config = JSON.parse(fs.readFileSync('config/config.json', 'utf8'))
  , target = config.target
  , app    = express()
  , server = http.createServer(app)
  , io     = require('socket.io')(server)

var formatter = require('./lib/formatter')

var createResponse = function(command, data) {
  return { command: command, data: data }
}

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views')
app.use(express.static(__dirname + '/public'))

app.get('/', function(req, res) {
  res.render('index.ejs', {
    mud: target.name
  })
})

io.sockets.on('connection', function(socket) {
  var mud = net.createConnection(target.port, target.host)
  mud.setEncoding('utf8')

  console.log(socket.id + ' connected to ' + target.host + ':' + target.port)

  mud.addListener('data', function(data) {
    socket.emit('message', createResponse('updateWorld', formatter.go(data)))
  })

  socket.on('message', function(data) {
    try {
      mud.write(data)
    } catch(e) {
      console.log('Caught exception: ' + e)
    }
  })
})

server.listen(config.muckyPort)

console.log('Mucky server started on http://localhost:' + config.muckyPort)
