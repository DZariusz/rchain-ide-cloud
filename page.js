"use strict"

document.addEventListener("DOMContentLoaded", () => {

  // Grab DOM items
  let ideCode = document.getElementById('ide-code')
  let ideAck = document.getElementById('ide-ack')
  let ideAckLastBlocks = document.getElementById('ide-ack-last-blocks')
  let ideAckLastMsgs = document.getElementById('ide-ack-last-msgs')
  let resultP = document.getElementById('status')

  // Event Listeners
  document.getElementById('ide-deploy').addEventListener('click', () => ideExecute(true, false));

  document.getElementById('ide-propose').addEventListener('click', () => ideExecute(false, true));

  document.getElementById('ide-execute').addEventListener('click', () => ideExecute(true, true));

  document.getElementById('ide-listen').addEventListener('click', () => ideExecute(false, false));

  document.getElementById('ide-code').addEventListener('keyup', ideCodeChange);
  document.getElementById('ide-ack').addEventListener('keyup', ideCodeChange);

  ideCode.value = localStorage.getItem('ide-code');
  ideAck.value = localStorage.getItem('ide-ack');

  function empty(str) {
    return /^[\s\r\n\t]*$/.test(str);
  }
  function ideCodeChange() {
    if (!empty(ideCode.value)) {      
      localStorage.setItem('ide-code', ideCode.value);
    }
    if (!empty(ideAck.value)) {      
      localStorage.setItem('ide-ack', ideAck.value);
    }
  }

  function executing(inProgress) {
    let btns = document.getElementsByTagName("button");    
    for (let i in btns) {
      if (typeof btns[i] !== "object") continue;
      btns[i].disabled = inProgress;
    };
  }

  function ideExecute(deploy, propose){
    // Validate form data
    if (deploy && empty(ideCode.value)) {
      console.log("Code is empty")
      return
    }

    executing(true);

    // Setup the request
    let body = {
      code: deploy ? ideCode.value : null,
      propose,
      deploy,
      ack: ideAck.value,
      ackLastBlocks: ideAckLastBlocks.value,
      ackLastMsgs: ideAckLastMsgs.value
    }

    
    makePost('/execute', body)
    .then(data => {
      console.log(data);
      Object.keys(data).forEach((k) => {
        console.log(k, data[k]);
      });      
      executing(false);
    })

  }
  
  /**
   * Abstract the boring part of making a post request
   * @param route The request destination as a string. ex: '/call'
   * @param body An object of the data to be passed
   * @return A promise for a response object
   */
  function makePost(route, body){
    let request = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
      },
      body: JSON.stringify(body)
    }

    return fetch(route, request)
    .then(res => {return res.json()})
  }
})
