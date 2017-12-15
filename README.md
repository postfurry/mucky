# mucky

[![Maintenance](https://img.shields.io/maintenance/yes/2017.svg)]()

A MU* (MUCK/MUD/MUSH/etc) client in your browser using node.js & websockets.

This was written for and tested on FuzzBall 6 MUCKs, but should basically work with any telnet MU*

## Features

- Command history
- Connection reattachment (during the same browser session)

## Non-features

- ANSI color (See [#18](https://github.com/postfurry/mucky/issues/18)

## Installation

    $ git clone git://github.com/postfurry/mucky.git
    $ cd mucky
    $ npm install
    $ vim config/config.json
    $ npm start
    $ open http://localhost:6660

Based on https://github.com/dannytatom/muddy
