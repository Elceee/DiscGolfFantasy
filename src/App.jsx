import React, { Component } from "react";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      idInput: ""
    };
  }
  onSubmitHandler = async event => {
    event.preventDefault();
    let data = new FormData();
    data.append("id", this.state.idInput);
    let response = await fetch("/loadEventDetails", {
      method: "POST",
      body: data
    });
    let responseBody = await response.text();
    let body = JSON.parse(responseBody);
    if (body.success) {
      alert("Event Added");
      this.setState({ idInput: "" });
    } else {
      alert("Maybe a problem");
      this.setState({ idInput: "" });
    }
  };

  onChangeHandler = event => {
    this.setState({ idInput: event.target.value });
  };

  render = () => {
    return (
      <div>
        <form onSubmit={this.onSubmitHandler}>
          <div>Enter PDGA event id number</div>
          <input
            type="text"
            onChange={this.onChangeHandler}
            value={this.state.idInput}
          />
          <input type="submit" />
        </form>
      </div>
    );
  };
}

export default App;
