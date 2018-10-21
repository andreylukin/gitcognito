import React, { PropTypes, Component } from 'react';
import TodoTextInput from './TodoTextInput';

import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import CryptoJS from 'crypto-js';

export default class Header extends Component {

  static propTypes = {
    addTodo: PropTypes.func.isRequired
  };

  handleSave = (text) => {
    if (text.length !== 0) {
      this.props.addTodo(text);
    }
  };

  render() {
    return (
      <header>
        <h1>GitCognito</h1>
        <TodoTextInput
          newTodo
          onSave={this.handleSave}
          placeholder="Encryption Password"
        />
      </header>
    );
  }
}
