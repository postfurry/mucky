import { h, Component } from 'preact'
import io from 'socket.io-client'
import Cookie from 'js-cookie'
import uuidv4 from 'uuid/v4'

import OutputPane from './OutputPane.js'

export default class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      inputBuffer: '',
      scrollback: [],
      history: [],
      historyPos: 0
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
  }

  componentDidMount() {
    this.inputField.focus()
  }

  handleChange = () => {
    this.setState({inputBuffer: event.target.value})
  }

  handleKeyDown = (event) => {
    let newHistoryPos
    switch (event.keyCode) {
      case 13:
        event.preventDefault()
        const message = this.state.inputBuffer
        this.socket.emit('message', message)
        this.setState({
          inputBuffer: '',
          scrollback: this.state.scrollback.concat([{
            type: 'self',
            data: message + '\n',
            timestamp: new Date()
          }]),
          history: this.state.history.concat([message]),
          historyPos: this.state.historyPos + 1
        })
        return
      case 38:
        newHistoryPos = this.state.historyPos - 1
        if (event.target.selectionStart === 0 &&
            this.state.history[newHistoryPos]) {
          event.preventDefault()
          this.setState({
            inputBuffer: this.state.history[newHistoryPos],
            historyPos: newHistoryPos
          })
        }
        return
      case 40:
        newHistoryPos = this.state.historyPos + 1
        if (event.target.selectionStart === this.state.inputBuffer.length &&
            this.state.history[this.state.historyPos]) {
          event.preventDefault()
          this.setState({
            inputBuffer: this.state.history[newHistoryPos],
            historyPos: newHistoryPos
          })
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
      <OutputPane scrollback={this.state.scrollback} />
      <div className="input-pane">
        <textarea ref={(el) => { this.inputField = el }}
          value={this.state.inputBuffer}
          onKeyDown={this.handleKeyDown}
          onKeyUp={this.handleChange}
          onChange={this.handleChange}
        />
      </div>
    </div>)
  }
}
