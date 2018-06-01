import React from 'react';
import './Card.css';

export class Row extends React.Component {
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
      <Item item={this.props.stockObj.stockcount} width={50} textAlign={'center'} clr={'black'}/>
      <Item item={this.props.stockObj.xirr_overall} width={50} textAlign={'center'} clr={xirrColor1}/>
      <Item item={this.props.stockObj.xirr_realized} width={50} textAlign={'center'} clr={xirrColor2}/>
      <Item item={this.props.stockObj.xirr_unrealized} width={50} textAlign={'center'} clr={xirrColor3}/>
      <Item item={this.props.stockObj.period} width={50} textAlign={'center'} clr={'black'}/>
      <Item item={this.props.stockObj.absolutereturn} width={50} textAlign={'center'} clr={'black'}/>
    </li>
    );
  }
}

export class Item extends React.Component {

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

export default Row;