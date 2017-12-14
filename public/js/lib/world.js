var World = function(selector) {
  this.selector = selector
  this.history  = []
  this.current  = 0
}

World.prototype.update = function(data) {
  $(this.selector).append(data)
  $(this.selector).prop({ scrollTop: $(this.selector).prop('scrollHeight') })
}

World.prototype.selfMesssage = function(message) {
  this.update("<span class='self'>" + message + "</span>\r\n")
}

World.prototype.systemMessage = function(message) {
  this.update("\r\n<span class='yellow'># " + message + "</span>\r\n")
}

World.prototype.updateHistory = function(command) {
  this.history.push(command)
  this.current = this.history.length
}
