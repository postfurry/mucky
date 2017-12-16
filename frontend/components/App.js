import { h, Component } from 'preact'
import io from 'socket.io-client'
import Cookie from 'js-cookie'
import uuidv4 from 'uuid/v4'

import OutputPane from './OutputPane.js'

const confirmClose = function(event) {
  const confirmationMessage = 'Are you sure you want to disconnect?'

  event.returnValue = confirmationMessage
  return confirmationMessage
}

export default class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      inputBuffer: '',
      scrollback: [],
      history: [],
      historyPos: 0,
      bottomPanel: 'input',
      username: window.localStorage.getItem('muckUsername') || '',
      password: window.localStorage.getItem('muckPassword') || ''
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

    this.socket.on('worldSignal', signal => {
      if (signal.startsWith('Login? (connect [username] [password])')) {
        this.showLoginPane()
      } else if (signal.startsWith('Login successful!')) {
        window.addEventListener('beforeunload', confirmClose)
        window.localStorage.setItem('muckUsername', this.state.username)
        window.localStorage.setItem('muckPassword', this.state.password)
        this.showInputPane()
      } else {
        this.setState({
          scrollback: this.state.scrollback.concat([
            {
              type: 'system',
              data: signal,
              timestamp: new Date()
            }
          ])
        })
      }
    })

    this.socket.on('disconnect', () => {
      window.removeEventListener('beforeunload', confirmClose)
      this.setState({
        bottomPanel: 'connect',
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

  showLoginPane() {
    this.setState(
      {
        bottomPanel: 'login'
      },
      () => {
        this.loginField.focus()
      }
    )
  }

  showInputPane() {
    this.setState(
      {
        bottomPanel: 'input'
      },
      () => {
        this.inputField.focus()
      }
    )
  }

  doLogin = event => {
    event.preventDefault()
    if (this.state.username && this.state.password) {
      this.socket.emit('login', this.state.username, this.state.password)
    }
    return false
  }

  doReconnect = () => {
    window.location.reload()
  }

  handleChange(property) {
    return event => {
      this.setState({ [property]: event.target.value })
    }
  }

  handleInputChange = event => {
    this.setState({ inputBuffer: event.target.value })
  }

  listUsers = event => {
    event.preventDefault()
    this.socket.emit('worldInput', 'WHO')
  }

  handleInputKeyDown = event => {
    let newHistoryPos
    switch (event.keyCode) {
      case 13:
        event.preventDefault()
        this.handleInputChange(event)
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
          WebClient &beta; &middot; Report issues on the Discord server or{' '}
          <a target="_blank" href="https://github.com/postfurry/mucky/issues">
            Github
          </a>
        </div>
        <OutputPane scrollback={this.state.scrollback} />
        {this.state.bottomPanel === 'login' ? (
          <form className="login-pane" onSubmit={this.doLogin}>
            <input
              ref={el => {
                this.loginField = el
              }}
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
            <button onClick={this.doLogin}>Login</button>
            <button onClick={this.listUsers}>Who's online?</button>
          </form>
        ) : null}
        {this.state.bottomPanel === 'input' ? (
          <div className="input-pane">
            <textarea
              style={{ margin: 0, padding: 0 }}
              ref={el => {
                this.inputField = el
              }}
              value={this.state.inputBuffer}
              onKeyDown={this.handleInputKeyDown}
            />
          </div>
        ) : null}
        {this.state.bottomPanel === 'connect' ? (
          <div className="reconnect-pane">
            <button onClick={this.doReconnect}>Connect</button>
          </div>
        ) : null}
      </div>
    )
  }
}
