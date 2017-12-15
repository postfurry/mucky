import { h, Component } from 'preact'
import classNames from 'classnames'

import OutputLine from './OutputLine.js'

/** @jsx h */

export default class OutputPane extends Component {
  constructor(props) {
    super(props)
    this.scrollToBottom = this.scrollToBottom.bind(this)
  }

  scrollToBottom() {
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
