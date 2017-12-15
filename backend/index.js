const fs = require('fs')
const net = require('net')
const http = require('http')
const path = require('path')
const express = require('express')

const config = JSON.parse(fs.readFileSync('config/config.json', 'utf8'))
const target = config.target
const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server)

const webpackConfig = require('../frontend/webpack.config.js')

const isDevelopment = process.env.NODE_ENV !== 'production'
const frontendSrc = path.resolve(__dirname, '..', 'frontend')

var createResponse = function(command, data) {
  return { command: command, data: data }
}

// String to watch for from the server that tells us we're getting a signal from the client
var SIGNAL_MARKER = '>>> '

if (isDevelopment) {
  const compiler = require('webpack')(webpackConfig)
  app.use(
    require('webpack-dev-middleware')(compiler, {
      publicPath: webpackConfig.output.publicPath,
      quiet: true
    })
  )
} else {
  app.use(express.static(path.resolve(frontendSrc, 'build')))
}
app.use(express.static(path.resolve(frontendSrc, 'public')))

let sessions = {}

let getNewWorldConnection = function() {
  let worldConnection = net.createConnection(target.port, target.host)
  worldConnection.setEncoding('utf8')
  return worldConnection
}

io.sockets.on('connection', function(socket) {
  let sessionId

  let log = function(message) {
    console.log(socket.id + ' : ' + message)
  }

  socket.on('sessionId', function(clientSessionId) {
    let worldConnection
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
      socket.emit('newConnection')
    }

    // It's much nicer for the client to present data one line at a time, and
    // this usually works, but there are some edge-cases where the server sends
    // multiple lines at once (like a non-logged-in WHO) and other cases where
    // the server breaks off before sending a newline (Large amounts of data
    // maybe?). So we normalize all that by reading into a buffer until we see
    // a read that ends in a newline, and THEN split it all by newlines and send
    // to the client one line at a time.
    let serverBuffer = ''

    let handleData = function(data) {
      serverBuffer += data
      const lastByte = data[data.length - 1]
      if (lastByte === '\n') {
<<<<<<< HEAD
        serverBuffer.split('\n').forEach(line => {
          socket.emit('worldLine', line)
=======
        serverBuffer.split('\n').forEach((line) => {
          if (line.startsWith(SIGNAL_MARKER)) {
            socket.emit('worldSignal', line.replace(SIGNAL_MARKER, '').replace('\n', ''))
          } else {
            socket.emit('worldLine', line)
          }
>>>>>>> Handle login/input/reconnect states predictably
        })
        serverBuffer = ''
      }
    }

    worldConnection.addListener('data', handleData)

    let handleClose = function() {
      log('disconnected from world, closing session ' + sessionId)
      socket.disconnect()
      delete sessions[sessionId]
    }

    worldConnection.addListener('close', handleClose)

    socket.on('login', function(username, password) {
      try {
        worldConnection.write(`connect ${username} ${password}\n`)
      } catch(e) {
        log('caught exception: ' + e)
      }
    })

    socket.on('worldInput', function(data) {
      try {
        worldConnection.write(data + '\n')
      } catch (e) {
        log('caught exception: ' + e)
      }
    })

    socket.on('disconnect', function(data) {
      log('disconnected from webclient session ' + sessionId)
      if (sessions[sessionId]) {
        sessions[sessionId].sockets--
        sessions[sessionId].lastActive = new Date()
      }
      worldConnection.removeListener('data', handleData)
      worldConnection.removeListener('close', handleClose)
    })
  })
})

const staleSessionMilliseconds = 60 * 1000

// We only want to keep detached sessions around briefly, so we poll for
// detached sessions with no activity in the last minute, and close them.
setInterval(function() {
  Object.keys(sessions).forEach(function(sessionId) {
    let session = sessions[sessionId]
    if (
      !session.sockets &&
      new Date() - session.lastActive > staleSessionMilliseconds
    ) {
      console.log('Pruning stale orphan session: ' + sessionId)
      session.connection.destroy()
      delete sessions[sessionId]
    }
  })
}, staleSessionMilliseconds)

server.listen(config.muckyPort)

console.log('Mucky server started on http://localhost:' + config.muckyPort)
