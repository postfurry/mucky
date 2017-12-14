import { h, Component } from 'preact'

/** @jsx h */

export default class App extends Component {
  render() {
    return (<div className="app">
      <div className="banner">
        <a target="_blank" href="http://postfurry.net/muck">PFMuck</a> WebClient &alpha;
        &middot; Experimental code &middot;
        Report issues on the Discord server or {' '}
        <a target="_blank" href="https://github.com/postfurry/mucky/issues">Github</a>
      </div>
      <div className="output-pane">Output Pane</div>
      <div className="input-pane">
        <textarea />
      </div>
    </div>)
  }
}
