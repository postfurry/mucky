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

io.sockets.on('connection', function(socket) {
  var worldConnection = net.createConnection(target.port, target.host)
  worldConnection.setEncoding('utf8')

  var log = function(message) {
    console.log(socket.id + ' : ' + message)
  }

  log('connected to world ' + target.host + ':' + target.port)

  worldConnection.addListener('data', function(data) {
    socket.emit('message', createResponse('updateWorld', formatter.go(data)))
  })

  worldConnection.addListener('close', function() {
    log('disconnected from world')
    socket.disconnect()
  })

  socket.on('message', function(data) {
    try {
      worldConnection.write(data + '\n')
    } catch(e) {
      log('caught exception: ' + e)
    }
  })

  socket.on('disconnect', function(data) {
    log('disconnected from webclient')
    worldConnection.destroy();
  })
})

server.listen(config.muckyPort)

console.log('Mucky server started on http://localhost:' + config.muckyPort)
