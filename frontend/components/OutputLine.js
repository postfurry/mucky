import { h, Component } from 'preact'
import classNames from 'classnames'

export default class OutputLine extends Component {
  render() {
    const className = classNames('output-line', this.props.type)
    return (<div className={className} title={this.props.timestamp}>
      {this.props.data}
    </div>)
  }
}
