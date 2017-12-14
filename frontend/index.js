import { h, render, Component } from 'preact'

// Tell Babel to transform JSX into h() calls:
/** @jsx h */

class App extends Comoponent {
  render() {
    return <div id="app">Hello world!</div>
  }
}

render(<App />, document.body)
