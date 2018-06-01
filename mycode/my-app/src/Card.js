import React from 'react';
import './Card.css';

class Square extends React.Component {
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
 
class Label extends React.Component {
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

class Row extends React.Component {
  render() {
    let xirrColor1 = undefined;
    let xirrColor2 = undefined;
    let xirrColor3 = undefined;
    xirrColor1 = this.props.stockObj.xirr_overall < 0 ? 'red':'green';
    xirrColor2 = this.props.stockObj.xirr_realized < 0 ? 'red':'green';
    xirrColor3 = this.props.stockObj.xirr_unrealized < 0 ? 'red':'green';
    
    return (
    <li className="rows">
      <Item item={this.props.stockObj.stockname} width={200} textAlign={'left'} clr={'black'}/>
      <Item item={this.props.stockObj.stockcount} width={100} textAlign={'center'} clr={'black'}/>
      <Item item={this.props.stockObj.xirr_overall} width={100} textAlign={'center'} clr={xirrColor1}/>
      <Item item={this.props.stockObj.xirr_realized} width={100} textAlign={'center'} clr={xirrColor2}/>
       <Item item={this.props.stockObj.xirr_unrealized} width={100} textAlign={'center'} clr={xirrColor3}/>
    </li>
    );
  }
}

class Item extends React.Component {

  render() {
    
    var ItemStyle = {
      fontFamily: "sans-serif",
      color: this.props.clr,
      fontSize: 10,
      width: this.props.width,
      padding: 5,
      textAlign: this.props.textAlign
    };
    return (
    <p style={ItemStyle}>{this.props.item}</p>  
    );
  }
}
 
export class Card extends React.Component {
  render() {
    var cardStyle = {
      height: 100,
      width: 50,
      padding: 0,
      backgroundColor: "#FFF",
      WebkitFilter: "drop-shadow(0px 0px 5px #666)",
      filter: "drop-shadow(0px 0px 5px #666)"
    };
    
    const numbers = [0];
    var listItems = numbers.map((number) => <div style={cardStyle} key={number.toString()}> <Square color={this.props.color} number={number} /> <Label xirr={this.props.color}/>  </div>);
    
    if (this.props.stock !== 0) {
      listItems = this.props.stock.map((stk) => <Row key={stk.id} stockObj={stk}/>);
    }
    
    const header_row = { id: 0,
                       symbol: "Stock Symbol",
                       stockname: "Stock Name",
                       stockcount: "Stock Count",
                       xirr_overall: "XIRR Overall",
                       xirr_realized: "XIRR Realized",
                       xirr_unrealized: "XIRR Unrealized",
                     };
                     
    const listItemHeader = <Row key={0} stockObj={header_row}/>;
    
    return (
    <ol className="cards">{listItemHeader}{listItems}</ol>
    );
  }
}
 
export default Card;