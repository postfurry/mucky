var fs      = require('fs')
  , net     = require('net')
  , http    = require('http')
  , express = require('express')
  , xkcdPassword = require('xkcd-password')
  , depromisify = require('depromisify').depromisify

var config = JSON.parse(fs.readFileSync('config/config.json', 'utf8'))
  , target = config.target
  , app    = express()
  , server = http.createServer(app)
  , io     = require('socket.io')(server)
  , sidGenerator = new xkcdPassword()

sidOptions = {
  numWords: 3,
  minLength: 4,
  maxLength: 6
}

getSid = function() {
  var wordList = depromisify(sidGenerator.generate(sidOptions))
  return wordList.join('-')
}

var formatter = require('./lib/formatter')

const webpackConfig = require('./webpack.config.js')

const isDevelopment = process.env.NODE_ENV !== 'production';

var createResponse = function(command, data) {
  return { command: command, data: data }
}

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views')
app.use(express.static(__dirname + '/public'))

if (isDevelopment) {
  const compiler = require('webpack')(webpackConfig);
  app.use(require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    quiet: true
  }));
}

app.get('/', function(req, res) {
  res.render('index.ejs', {
    worldName: target.name
  })
})

var worldConnections = {}

var getNewWorldConnection = function() {
  var worldConnection = net.createConnection(target.port, target.host)
  worldConnection.setEncoding('utf8')
  return worldConnection
}

io.sockets.on('connection', function(socket) {
  var sessionId

  var log = function(message) {
    console.log(socket.id + ' : ' + message)
  }

  socket.on('sessionId', function(clientSessionId) {
    var worldConnection
    log('got sessionId from client: ' + clientSessionId)
    sessionId = clientSessionId
    if (worldConnections[sessionId]) {
      log('found existing world connection for sessionId, reattaching')
      worldConnection = worldConnections[sessionId]
    } else {
      log('found no connection for sessionId, creating new connection')
      worldConnection = getNewWorldConnection()
      worldConnections[sessionId] = worldConnection
    }

    var handleData = function(data) {
      socket.emit('message', createResponse('updateWorld', formatter.go(data)))
    }

    worldConnection.addListener('data', handleData)

    var handleClose = function() {
      log('disconnected from world')
      socket.disconnect()
      delete worldConnections[sessionId];
    }

    worldConnection.addListener('close', handleClose)

    socket.on('message', function(data) {
      try {
        worldConnection.write(data + '\n')
      } catch(e) {
        log('caught exception: ' + e)
      }
    })

    socket.on('disconnect', function(data) {
      log('disconnected from webclient')
      worldConnection.removeListener('data', handleData);
      worldConnection.removeListener('close', handleClose);
    })
  })
})

server.listen(config.muckyPort)

console.log('Mucky server started on http://localhost:' + config.muckyPort)
