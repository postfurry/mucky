# mucky

[![Maintenance](https://img.shields.io/maintenance/no/2014.svg)]()

A MUCK client in your browser usin' node.js & websockets.

This is very bare-bones and should basically work with any telnet MU*

## Features

- Command History
- Aliases
- Triggers

## Installation & Usage

### Installation

    $ git clone git://github.com/dannytatom/muddy.git
    $ cd muddy
    $ npm install
    $ vim config/config.json
    $ npm start
    $ open http://localhost:6660

### Aliases

    ;alias add {go home} {invoke stone} # Add an alias
    ;alias rm {go home}                 # Remove an alias
    ;alias ls                           # List aliases

### Triggers

    ;trigger add {Your Selection:} {1} # Add a trigger
    ;trigger rm {Your Selection:}      # Remove a trigger
    ;trigger ls                        # List triggers
