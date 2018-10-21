import React, { Component } from 'react';
import { render } from 'react-dom';
import Dock from 'react-dock';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import CryptoJS from 'crypto-js';

class InjectApp extends Component {
  constructor(props) {
    super(props);
    this.state = { isVisible: false };
  }

  buttonOnClick = () => {

    //const bigDaddyDiv = document.getElementsByTagName('tbody');
    const allLinesOfCode = document.getElementsByTagName('tr');
    let allTheCode = '';
    for (let i = 0; i < allLinesOfCode.length; i++) {
      //console.log(hljs.highlightAuto(allLinesOfCode[i].innerText));
      //allLinesOfCode[i].appendChild(tag);
      allTheCode += allLinesOfCode[i].innerText + '\n';
    }

    // Find the name of the file and parse it's extension to determine the language (Assuming it's already been decrypted :p)
    const fileNameArray = document.getElementsByClassName('final-path')[0].innerText.split('.');
    const fileExtension = fileNameArray[fileNameArray.length - 1];
    //const codingLanguage = hljs.getLanguage(fileExtension);
    //console.log(codingLanguage);

    let highlightedCode = hljs.highlight(fileExtension, allTheCode);
    //console.log(highlightedCode);
    //console.log(highlightedCode.value);


    // This does not work please help
    const ciphertext = '43e1371b9c338f6c65e7036c';
    const bytes = CryptoJS.AES.decrypt(ciphertext.toString(), 'hackgt');
    // Crashes @ this point
    //const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    //console.log(decryptedData);

    // Split our highlighted code based on newline characters into an array
    highlightedCode = highlightedCode.value.split('\n');

    // replace spans on webpage with new ones generated
    let i = 1;
    let currentParent = document.getElementById('LC' + i);
    while (currentParent !== null && currentParent !== undefined) {
      // Replace class variables, from hilight.js syntax to github syntax
      highlightedCode[i] = highlightedCode[i].replace('hljs-string', 'pl-s');
      highlightedCode[i] = highlightedCode[i].replace('hljs-keyword', 'pl-k');
      highlightedCode[i] = highlightedCode[i].replace('hljs-number', 'pl-c1');
      highlightedCode[i] = highlightedCode[i].replace('hljs-comment', 'pl-c');
      //console.log(highlightedCode[i]);
      if (highlightedCode[i] !== '') {
        currentParent.innerHTML = highlightedCode[i];
      }
      currentParent = document.getElementById('LC' + ++i);
    }

    this.setState({ isVisible: !this.state.isVisible });
  };

  render() {
    return (
      <div>
        <button onClick={this.buttonOnClick}>
          Encrypt / Decrypt
        </button>
        <Dock
          position="right"
          dimMode="transparent"
          defaultSize={0.4}
          isVisible={this.state.isVisible}
        >
          <iframe
            style={{
              width: '100%',
              height: '100%',
            }}
            frameBorder={0}
            allowTransparency="true"
            src={chrome.extension.getURL(`inject.html?protocol=${location.protocol}`)}
          />
        </Dock>
      </div>
    );
  }
}

window.addEventListener('load', () => {
  const injectDOM = document.createElement('div');
  injectDOM.className = 'inject-react-example';
  injectDOM.style.textAlign = 'center';
  document.body.appendChild(injectDOM);
  render(<InjectApp />, injectDOM);
});
