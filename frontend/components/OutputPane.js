import { h, Component } from 'preact'

import OutputLine from './OutputLine.js'

export default class OutputPane extends Component {
  scrollToBottom = () => {
    this.outputEnd.scrollIntoView()
  }

  componentDidMount() {
    this.scrollToBottom()
  }

  componentDidUpdate() {
    this.scrollToBottom()
  }

  render() {
    return (<div className="output-pane">
      { this.props.scrollback.map((line) => {
        return <OutputLine
          type={line.type}
          data={line.data}
          timestamp={line.timestamp}
        />
      })}
      <div className="output-bottom" ref={(el) => { this.outputEnd = el }} />
    </div>)
  }
}
