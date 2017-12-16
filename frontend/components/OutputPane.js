import { h, Component } from 'preact'

import OutputLine from './OutputLine.js'

export default class OutputPane extends Component {
  scrollToBottom = () => {
    this.output.scrollTop = this.output.scrollHeight
  }

  handleResize = () => this.forceUpdate()

  componentDidMount() {
    this.scrollToBottom()
    window.addEventListener('resize', this.handleResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  componentDidUpdate() {
    this.scrollToBottom()
  }

  render() {
    return (
      <div
        className="output-pane"
        ref={el => {
          this.output = el
        }}
      >
        {this.props.scrollback.map(line => {
          return (
            <OutputLine
              type={line.type}
              data={line.data}
              timestamp={line.timestamp}
            />
          )
        })}
      </div>
    )
  }
}
