import { h, render, Component } from 'preact'

import './index.css'

// Tell Babel to transform JSX into h() calls:
/** @jsx h */

class App extends Component {
  render() {
    return <div id="app">Hello world!</div>
  }
}

render(<App />, document.body)
