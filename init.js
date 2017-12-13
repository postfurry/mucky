var fs      = require('fs')
  , net     = require('net')
  , http    = require('http')
  , express = require('express')

var config = JSON.parse(fs.readFileSync('config/config.json', 'utf8'))
  , target = config.target
  , app    = express()
  , server = http.createServer(app)
  , io     = require('socket.io')(server)

var alias     = require('./lib/alias')
  , trigger   = require('./lib/trigger')
  , formatter = require('./lib/formatter')

var createResponse = function(command, data) {
  return { command: command, data: data }
}

var log = function(string) {
  console.log('\033[36m[ mucky ]\033[0m → ' + string)
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

  log(socket.id + ' connected to ' + target.host + ':' + target.port)

  mud.addListener('data', function(data) {
    var commands  = trigger.scan(data)
      , formatted = formatter.go(data)

    socket.emit('message', createResponse('updateWorld', formatted))

    if (commands) {
      for (var i = 0; i < commands.length; i++) {
        mud.write(commands[i])
      }
    }
  })

  socket.on('message', function(data) {
    mud.write(alias.format(data))
  })
})

server.listen(config.muckyPort)

log('Server started on http://localhost:6660')
