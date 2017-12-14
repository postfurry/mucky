$(function() {
  var world   = new World('#output-pane')
    , socket  = io.connect()

  var resizeUI = function() {
    $('#output-pane').prop({ scrollTop: $('#output-pane').prop('scrollHeight') })
  }

  resizeUI()

  socket.on('connect', function() {
    $('.input-box').focus()

    $('.input-box').on('keydown', function(event) {
      if (event.keyCode == 13) {
        event.preventDefault();
        socket.emit('message', $('.input-box').val())
        world.selfMesssage($('.input-box').val())
        world.updateHistory($('.input-box').val())

        $('.input-box').val('')
      } else if (event.keyCode == 38) {
        if (this.selectionStart === 0 && world.history[world.current - 1]) {
          event.preventDefault();
          $('.input-box').val(world.history[world.current -= 1])
        }
      } else if (event.keyCode == 40) {
        if (this.selectionStart === $('.input-box').val().length && world.history[world.current]) {
          event.preventDefault();
          $('.input-box').val(world.history[world.current += 1])
        }
      }
    })

    $(window).on('resize', function(event) {
      resizeUI()
    })

    $(window).on('beforeunload', function() {
      return 'Are you sure you want to disconnect?'
    })

    $(window).on('unload', function() {
      socket.emit('message', 'QUIT')
    })
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
