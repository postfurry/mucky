import { h, Component } from 'preact'
import classNames from 'classnames'
import Linkify from 'react-Linkify'
import moment from 'moment'

export default class OutputLine extends Component {
  constructor(props) {
    super(props)
    this.noAnsiData = this.props.data.replace(/\[((\d*);){0,2}(\d*)m/g, '')

    this.timestamp = moment(this.props.timestamp).format('h:mm:ssa MMM DD')
  }
  render() {
    const className = classNames('output-line', this.props.type)

    return (
      <div className={className} title={this.timestamp}>
        <Linkify>{this.noAnsiData}</Linkify>
      </div>
    )
  }
}
