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
      historyPos: 0,
      showLogin: false,
      username: '',
      password: ''
    }

    this.socket = io.connect()

    this.socket.on('connect', () => {
      let sessionId = Cookie.get('sessionId')
      if (!sessionId) {
        sessionId = uuidv4()
        Cookie.set('sessionId', sessionId)
      }
      this.socket.emit('sessionId', sessionId)
    })

    this.socket.on('worldLine', line => {
      this.setState({
        scrollback: this.state.scrollback.concat([
          {
            type: 'world',
            data: line,
            timestamp: new Date()
          }
        ])
      })
    })

    this.socket.on('newConnection', () => {
      this.setState({
        showLogin: true
      })
    })

    this.socket.on('disconnect', () => {
      this.setState({
        scrollback: this.state.scrollback.concat([
          {
            type: 'system',
            data: 'Connection closed',
            timestamp: new Date()
          }
        ])
      })
    })
  }

  componentDidMount() {
    this.inputField.focus()
  }

  handleLogin = event => {
    event.preventDefault()
    if (this.state.username && this.state.password) {
      this.socket.emit('login', this.state.username, this.state.password)
      // TODO: This should only happen after we've confirmed a successful login
      this.setState({
        showLogin: false
      })
    }
  }

  handleChange(property) {
    return event => {
      this.setState({ [property]: event.target.value })
    }
  }

  handleInputChange = () => {
    this.setState({ inputBuffer: event.target.value })
  }

  handleInputKeyDown = event => {
    let newHistoryPos
    switch (event.keyCode) {
      case 13:
        event.preventDefault()
        const message = this.state.inputBuffer
        this.socket.emit('worldInput', message)
        this.setState({
          inputBuffer: '',
          scrollback: this.state.scrollback.concat([
            {
              type: 'self',
              data: message,
              timestamp: new Date()
            }
          ]),
          history: this.state.history.concat([message]),
          historyPos: this.state.historyPos + 1
        })
        return
      case 38:
        newHistoryPos = this.state.historyPos - 1
        if (
          event.target.selectionStart === 0 &&
          this.state.history[newHistoryPos]
        ) {
          event.preventDefault()
          this.setState({
            inputBuffer: this.state.history[newHistoryPos],
            historyPos: newHistoryPos
          })
        }
        return
      case 40:
        newHistoryPos = this.state.historyPos + 1
        if (
          event.target.selectionStart === this.state.inputBuffer.length &&
          this.state.history[this.state.historyPos]
        ) {
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
    return (
      <div className="app">
        <div className="banner">
          <a target="_blank" href="http://postfurry.net/muck">
            PFMuck
          </a>{' '}
          WebClient &alpha; &middot; Experimental code &middot; Report issues on
          the Discord server or{' '}
          <a target="_blank" href="https://github.com/postfurry/mucky/issues">
            Github
          </a>
        </div>
        <OutputPane scrollback={this.state.scrollback} />
        {this.state.showLogin ? (
          <form className="login-pane" onSubmit={this.handleLogin}>
            <input
              name="username"
              id="username"
              className="login-info"
              placeholder="username"
              maxLength="16"
              value={this.state.username}
              onChange={this.handleChange('username')}
            />
            <input
              name="password"
              className="login-info"
              placeholder="password"
              type="password"
              value={this.state.password}
              onChange={this.handleChange('password')}
            />
            {/* <input name="save" id="save-login"
            className="checkbox"
            type="checkbox"
            value={this.state.saveLogin}
          />
          <label for="save-login">Save?</label> */}
            <input type="submit" className="login-button" value="Login" />
          </form>
        ) : (
          <div className="input-pane">
            <textarea
              ref={el => {
                this.inputField = el
              }}
              value={this.state.inputBuffer}
              onKeyDown={this.handleInputKeyDown}
              onKeyUp={this.handleInputChange}
              onChange={this.handleInputChange}
            />
          </div>
        )}
      </div>
    )
  }
}
