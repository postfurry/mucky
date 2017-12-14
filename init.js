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

const webpackConfig = require('./webpack.config.js')

const isDevelopment = process.env.NODE_ENV !== 'production';

var createResponse = function(command, data) {
  return { command: command, data: data }
}

app.use(express.static(__dirname + '/public'))

if (isDevelopment) {
  const compiler = require('webpack')(webpackConfig);
  app.use(require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    quiet: true
  }));
}

// app.get('/', function(req, res) {
//   res.render('index.ejs', {
//     worldName: target.name
//   })
// })

var sessions = {}

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
    if (sessions[sessionId]) {
      log('found existing world connection for sessionId, reattaching')
      worldConnection = sessions[sessionId].connection
      sessions[sessionId].sockets++
    } else {
      log('found no connection for sessionId, creating new connection')
      worldConnection = getNewWorldConnection()
      sessions[sessionId] = {
        connection: worldConnection,
        lastActive: new Date(),
        sockets: 1
      }
    }

    var handleData = function(data) {
      socket.emit('message', createResponse('updateWorld', formatter.go(data)))
    }

    worldConnection.addListener('data', handleData)

    var handleClose = function() {
      log('disconnected from world, closing session ' + sessionId)
      socket.disconnect()
      delete sessions[sessionId];
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
      log('disconnected from webclient session ' + sessionId)
      if (sessions[sessionId]) {
        sessions[sessionId].sockets--
        sessions[sessionId].lastActive = new Date()
      }
      worldConnection.removeListener('data', handleData);
      worldConnection.removeListener('close', handleClose);
    })
  })
})

const staleSessionMilliseconds = 60 * 1000

// We only want to keep detached sessions around briefly, so we poll for
// detached sessions with no activity in the last minute, and close them.
setInterval(function(){
  Object.keys(sessions).forEach(function(sessionId){
    var session = sessions[sessionId]
    if (!session.sockets && new Date - session.lastActive > staleSessionMilliseconds) {
      console.log('Pruning stale orphan session: ' + sessionId)
      session.connection.destroy()
      delete sessions[sessionId]
    }
  })
}, staleSessionMilliseconds)

server.listen(config.muckyPort)

console.log('Mucky server started on http://localhost:' + config.muckyPort)
