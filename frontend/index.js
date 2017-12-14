import { h, render, Component } from 'preact'

import './index.css'
import App from './components/App.js'

// Tell Babel to transform JSX into h() calls:
/** @jsx h */

render(<App />, document.body)
