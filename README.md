# RChain IDE Cloud



This repository is a very simple tool that can help working with rholang development.

Base on [Joshy Orndorff examples](https://github.com/JoshOrndorff).

RNode Version: [0.6.4](https://github.com/rchain/rchain/releases/tag/v0.6.4)

## Run

This tool can run externally as long as you have connection to machine with your RNode.  
You can run as many instances of this tool as you want.

1. Install node.js and npm ([instructions](https://nodejs.org/en/))
1. Install dependencies `npm install`
1. Launch the IDE `npm start <RNode host> <RNode gRPC port> <frontend port>`
10. Navigate to the user interface in your browser at `localhost:<frontend port>`


## Interface

All data from server are displayed in console, so please open it.

### Name to listen on

This option executes `listenForDataAtName` on `rnode`.  
Additionally you can provide number of last block, from which you want to get data 
and number of messages to read. Unfortunately as far, order of messages is random,
so you probably want ot read all and investigate.

Hit `[Listen]` to request data without executing any code.

### Executing a code

Paste you code to the `textarea` and choose option to execute, 
then check you console for results.

