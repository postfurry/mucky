import { h, render, Component } from 'preact'

// Tell Babel to transform JSX into h() calls:
/** @jsx h */

console.log('In index.js')

class App extends Component {
  render() {
    console.log('In render!')
    return <div id="app">Hello world!</div>
  }
}

render(<App />, document.body)
