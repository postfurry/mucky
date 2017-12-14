import { h, Component } from 'preact'
import io from 'socket.io-client'
import Cookie from 'js-cookie'
import uuidv4 from 'uuid/v4'

import OutputLine from './OutputLine.js'

/** @jsx h */

export default class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      inputBuffer: '',
      scrollback: []
    }

    this.socket = io.connect()

    this.socket.on('connect', () => {
      var sessionId = Cookie.get('sessionId')
      if (!sessionId) {
        sessionId = uuidv4()
        Cookie.set('sessionId', sessionId)
      }
      this.socket.emit('sessionId', sessionId)
    })

    this.socket.on('message', (message) => {
      var command = message.command
        , data    = message.data

      if (command == 'updateWorld') {
        this.setState({
          scrollback: this.state.scrollback.concat([{
            type: 'world',
            data: data,
            timestamp: new Date()
          }])
        })
      }
    })

    this.socket.on('disconnect', () => {
      this.setState({
        scrollback: this.state.scrollback.concat([{
          type: 'system',
          data: 'Connection closed',
          timestamp: new Date()
        }])
      })
    })

    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(event) {
    this.setState({inputBuffer: event.target.value})
  }

  handleKeyDown(event) {
    switch (event.keyCode) {
      case 13:
        event.preventDefault()
        this.socket.emit('message', this.state.inputBuffer)
        this.setState({
          inputBuffer: '',
          scrollback: this.state.scrollback.concat([{
            type: 'self',
            data: this.state.inputBuffer + '\n',
            timestamp: new Date()
          }])
        })
        return
      case 38:
        if (event.target.selectionStart === 0) {
          event.preventDefault()
          console.log('go previous')
        }
        return
      case 40:
        if (event.target.selectionStart === this.state.inputBuffer.length) {
          event.preventDefault()
          console.log('go next')
        }
        return
    }
  }

  render() {
    return (<div className="app">
      <div className="banner">
        <a target="_blank" href="http://postfurry.net/muck">PFMuck</a> WebClient &alpha;
        &middot; Experimental code &middot;
        Report issues on the Discord server or {' '}
        <a target="_blank" href="https://github.com/postfurry/mucky/issues">Github</a>
      </div>
      <div className="output-pane">
        { this.state.scrollback.map((line) => {
          return <OutputLine
            type={line.type}
            data={line.data}
            timestamp={line.timestamp}
          />
        }) }
      </div>
      <div className="input-pane">
        <textarea
          value={this.state.inputBuffer}
          onKeyDown={this.handleKeyDown}
          onKeyUp={this.handleChange}
          onChange={this.handleChange}
        />
      </div>
    </div>)
  }
}
