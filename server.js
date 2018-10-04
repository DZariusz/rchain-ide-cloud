"use strict"

const express = require('express');
const bodyParser = require('body-parser');
const grpc = require('grpc')
const {RNode, RHOCore} = require("rchain-api")

// Parse command-line arguments
var host   = process.argv[2] ? process.argv[2] : "localhost"
var port   = process.argv[3] ? process.argv[3] : 40401
var uiPort = process.argv[4] ? process.argv[4] : 8080

// Configure the express app and RNode connection
var myNode = RNode(grpc, {host, port})
var app = express()
app.use(bodyParser.json())
app.use(express.static(__dirname))

// Start the express app
app.listen(uiPort, () => {
  console.log("Nth Caller Dapp server started.")
  console.log(`Connected to RNode at ${host}:${port}.`)
  console.log(`started on ${uiPort}`)
})



app.post('/execute', async (req, res) => {  
  
  let deployData = {
    term: req.body.code,
    timestamp: new Date().valueOf()
  }

  let returnObj = {}
  let deployed = false;

  try {
    
    if (req.body.deploy) {
      returnObj['deployMsg'] = await myNode.doDeploy(deployData);
      deployed = true;
    }
    if (req.body.propose) {      
      returnObj['proposeMsg'] = await myNode.createBlock()      
    }

    if (req.body.ack) {
      returnObj['ack'] 
        = app.formatAckData(
          await myNode.listenForDataAtName(req.body.ack), 
          req.body.ackLastBlocks,
          req.body.ackLastMsgs
        );
    }

    
  } catch(oops) { 
    returnObj[deployed ? 'proposeErr' : 'deployErr'] = oops.toString();        
  }

  console.log(returnObj);
  res.end(JSON.stringify(returnObj));
  
})

app.formatAckData = (response, numOfLastBlocks, numOfLastMsgs) => {
  // If no data is on RChain
  if(response.length === 0){    
    return false;
  }

  console.log("AckData response --------------------\n", response, "\n--------------------\n");

  let results = [];
  let msgCount = 0;

  // Grab back the last message sent
  response.slice(0, parseInt(numOfLastBlocks, 10)).map(lastBlock => {
    
    let obj = { 
      blockNumber: lastBlock.block.blockNumber, 
      postBlockData: [],
      block: lastBlock.block
    };

    numOfLastMsgs -= msgCount;
    if (numOfLastMsgs <= 0) return;
    
    lastBlock.postBlockData.slice(-parseInt(numOfLastMsgs, 10)).map(lastDatum => {
      console.log('bn#', obj.blockNumber, lastDatum);
      obj.postBlockData.push(RHOCore.toRholang(lastDatum));
      msgCount += 1;
      return;
    });    

    results.push(obj);
  });

  return results;
  
}

// Handle users calling in to win
app.post('/call', (req, res) => {

  // TODO this should be unforgeable. Can I make one from JS?
  let ack = Math.random().toString(36).substring(7)

  let code = `@"${req.body.id}"!("${req.body.name}", "${ack}")`
  let deployData = {term: code,
                    timestamp: new Date().valueOf(),
                   }

  myNode.doDeploy(deployData).then(_ => {
    // Force RNode to make a block immediately
    return myNode.createBlock()
  }).then(_ => {
    // Get the data from RNode
    return myNode.listenForDataAtName(ack)
  }).then((blockResults) => {
    // If no data is on RChain
    if(blockResults.length === 0){
      res.end(JSON.stringify({success: false}))
      return
    }
    // Grab back the last message sent
    var lastBlock = blockResults.slice(-1).pop()
    var lastDatum = lastBlock.postBlockData.slice(-1).pop()
    res.end(JSON.stringify(
      // Rholang process should be a string literal
      {success: true,
       message: RHOCore.toRholang(lastDatum),
     }))
  }).catch(oops => { console.log(oops); })
})
