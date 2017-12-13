$(function() {
  var world   = new World('#output-pane')
    , socket  = io.connect()

  var resizeUI = function() {
    $('#output-pane').attr({ scrollTop: $('#output-pane').attr('scrollHeight') })
  }

  resizeUI()

  socket.on('connect', function() {
    $('.input-box').focus()

    $('.input-box').keyup(function(event) {
      if (event.keyCode == 13) {
        socket.emit('message', $('.input-box').val())
        world.selfMesssage($('.input-box').val())
        world.updateHistory($('.input-box').val())

        $('.input-box').val('')
      } else if (event.keyCode == 38) {
        if (world.history[world.current - 1]) {
          $('.input-box').val(world.history[world.current -= 1])
        }
      } else if (event.keyCode == 40) {
        if (world.history[world.current]) {
          $('.input-box').val(world.history[world.current += 1])
        }
      }
    })

    window.onresize = function(event) {
      resizeUI()
    }
  })

  socket.on('message', function(message) {
    var command = message.command
      , data    = message.data

    if (command == 'updateWorld') {
      world.update(data)
    } else if (command == 'listAliases') {
      world.listAliases(data)
    } else if (command == 'listTriggers') {
      world.listTriggers(data)
    }
  })
})
