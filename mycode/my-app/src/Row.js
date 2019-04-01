import React from 'react';
import './Card.css';

export class Row extends React.Component {
  render() {
    var bkgdColor = 'lightyellow';
    var id = this.props.stockObj.id;

            
    if (id === 0) {
       bkgdColor = 'yellow';
     } else if (id === 1000) {
      bkgdColor = 'orange';
    } 
    
 
    return (
    <li className="rows">
      <Item item={this.props.stockObj.stockname} id={id} type='name' bkgdColor={bkgdColor}/>
      <Item item={this.props.stockObj.stockcount} id={id} type='number' bkgdColor={bkgdColor}/>
      <Item item={this.props.stockObj.avgcostprice} id={id} type='number' bkgdColor={bkgdColor}/>
      <Item item={this.props.stockObj.totalcostprice} id={id} type='number' bkgdColor={bkgdColor}/>
      <Item item={this.props.stockObj.currentmarketprice} id={id} type='number' bkgdColor={bkgdColor}/>
      <Item item={this.props.stockObj.totalvalue} id={id} type='number' bkgdColor={bkgdColor}/>
      <Item item={this.props.stockObj.unrealizedprofit} id={id} type='number' bkgdColor={bkgdColor}/>
      <Item item={this.props.stockObj.period} id={id} type='number' bkgdColor={bkgdColor}/>
      <Item item={this.props.stockObj.absolutereturn} id={id} type='number' bkgdColor={bkgdColor}/>
      <Item item={this.props.stockObj.xirr_unrealized} id={id} type='number' bkgdColor={bkgdColor}/>
      <Item item={this.props.stockObj.xirr_overall} id={id} type='number' bkgdColor={bkgdColor}/>
      <Item item={this.props.stockObj.xirr_realized} id={id} type='number' bkgdColor={bkgdColor}/>
    </li>
    );
  }
}

export class Item extends React.Component {

  render() {
  
    var ItemStyle = {
      fontFamily: "sans-serif",
      fontWeight: 'normal',
      color: 'black',  
      fontSize: 10,
      //      minWidth: 50,
      width: 50,
      whiteSpace: 'nowrap',
      padding: 5,
      margin: 1,
      textAlign: 'right',
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'black',
      overflow: 'hidden',
      backgroundColor: this.props.bkgdColor
    };
    
    var item = this.props.item;
   
    if (this.props.id === 0) {
      // process Header row
      ItemStyle.textAlign = 'center';
      ItemStyle.fontWeight = 'bold';
      ItemStyle.height = 40;
      ItemStyle.whiteSpace = 'wrap';
    } else {
      if (this.props.id === 1000) {
        ItemStyle.fontWeight = 'bold';
      }
      if (this.props.type === 'number') {
        ItemStyle.color = (this.props.item < 0)?'red':'black';
        item = item.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }
      else {
        ItemStyle.textAlign = 'left';
        ItemStyle.width = 200;
      }
    }
    
    if (this.props.type === 'name') {
      ItemStyle.width = 200;
    }
   
   return (
    <p style={ItemStyle}>{item}</p>  
    );
  }
}

export default Row;