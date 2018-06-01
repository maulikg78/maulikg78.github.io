import React from 'react';
import './Card.css';
import Row from './Row';

/*
export class Square extends React.Component {
  render() {
    var squareStyle = {
      height: 50,
      fontFamily: "sans-serif",
      fontWeight: "bold",
      fontSize: 10,
      backgroundColor: this.props.color
    };
 
    return (
      <div style={squareStyle}>
       {this.props.number}
      </div>
    );
  }
}
 
export class Label extends React.Component {
  render() {
    var labelStyle = {
      fontFamily: "sans-serif",
      fontWeight: "bold",
      fontSize: 10,
      padding: 5,
      margin: 0
    };
 
    return (
      <p style={labelStyle}>{this.props.xirr}</p>
    );
  }
}
*/

export class Card extends React.Component {
  render() {
    /*
    var cardStyle = {
      height: 100,
      width: 50,
      padding: 0,
      backgroundColor: "#FFF",
      WebkitFilter: "drop-shadow(0px 0px 5px #666)",
      filter: "drop-shadow(0px 0px 5px #666)"
    };
    */
    
    var listItems = <li>Waiting for loading of Portfolio...</li>;
    
    if (this.props.stock !== 0) {
      listItems = this.props.stock.map((stk) => <Row key={stk.id} stockObj={stk}/>);
    }
    
    return (
    <ol className="cards">{listItems}</ol>
    );
  }
}

export default Card;