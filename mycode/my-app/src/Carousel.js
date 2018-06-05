import React from 'react';
import './Carousel.css';
import FileInput from './file-taker';
import Row from './Row';
import './Card.css';

const dot="dot";
const active_dot = "dot active";
const slide_hide = "mySlides fade";
const slide_show = "mySlides_show fade";

let dot_class = [active_dot, dot, dot, dot, dot];
let slide_class = [slide_show, slide_hide, slide_hide, slide_hide, slide_hide];
const number_of_slides = slide_class.length -1 ;


export class Carousel extends React.Component {

  constructor(props) {
    super(props);
    this.state = { slideIndex : 0 };
    this.changeIndex = this.changeIndex.bind(this);
  }
  
  changeIndex(n) {
    this.setState({ slideIndex : n});
  }
  
  showSlides(n) {
      var idx = this.state.slideIndex;

     dot_class[idx] = dot;
     slide_class[idx] = slide_hide;
    
      if (n > number_of_slides) {
        idx = 0;
      } else if (n < 0) {
        idx = number_of_slides;
      } else {
        idx = n;
      }
      
      slide_class[idx] = slide_show; 
      dot_class[idx] = active_dot;
      this.changeIndex(idx);
  }
  

  render() {
/*
    let elements = undefined; 
    if (this.props.stk == undefined) {
      elements = <li>StockList</li>;
    } else {
      elements = this.props.stk.map((element) => {
              return (<li key={element.id}>{element.stockname}</li>);
      });
    }
*/

             
    return (
    
    <div>  
      <div className="slideshow-container tile-wrapper">
      
        <div className={slide_class[0]}>
          <div className="text">My Stock Watch</div>
          <div className="tile-box2 cards">
             <FileInput />
          </div>
        </div>
      
        <div className={slide_class[1]}>
          <div className="text text-color">My Route</div>
          <div className="tile-box2">
            <iframe id="maps" className ="noborder" src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d482676.05143371545!2d72.74198573346584!3d19.067841431681888!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e0!4m5!1s0x3be7c3a9e4ecbad3%3A0x9fb938081011325f!2sNeelsidhi+Splendour%2C+Sector+15%2C+CBD+Belapur%2C+Navi+Mumbai%2C+Maharashtra+400614%2C+India!3m2!1d19.0086759!2d73.03476739999999!4m5!1s0x3be7c0beddab5c77%3A0xd2f7874862ef69dd!2sReliance+Corporate+Park%2C+MIDC%2C+Ghansoli%2C+Navi+Mumbai%2C+Maharashtra+400701%2C+India!3m2!1d19.1275105!2d73.0076079!5e0!3m2!1sen!2sin!4v1515140868072" frameBorder="0" allowFullScreen></iframe>
            <div className="Notes">
               <p> From Home to Office using Google maps </p>
            </div>
          </div>
        </div>
        
        <div className={slide_class[2]}>
          <div className="text">My Fav Movies</div>
          <div className="tile-box2 scroll-box">
              <a id="imageLink0">
                <img id="myImage0" src="../images/kitten.jpg" alt="Movie" className="noborder" frameBorder="0" allowFullScreen />
              </a>
              <a id="imageLink1">
                <img id="myImage1" src="../images/kitten.jpg" alt="Movie" className="noborder" frameBorder="0" allowFullScreen />
              </a>
              <a id="imageLink2">
                <img id="myImage2" src="../images/kitten.jpg" alt="Movie" className="noborder" frameBorder="0" allowFullScreen />
              </a>
              <FileInput />
          </div>
        </div>
        
         <div className={slide_class[3]}>
          <div className="text">Shark Attack</div>
          <div className="tile-box2">
            <img src="/images/shark.jpg" />
          </div>
        </div>
        
        <div className={slide_class[4]}>
          <div className="text">I Love Kittens</div>
          <div className="tile-box2">
            <img src="/images/kitten.jpg" />
          </div>
        </div>
      
        <a className="prev" onClick={this.showSlides.bind(this, this.state.slideIndex - 1)}>&#10094;</a>
        <a className="next" onClick={this.showSlides.bind(this, this.state.slideIndex + 1)}>&#10095;</a>
        
        
        <div className="dotstyling">
          <span className={dot_class[0]} onClick={this.showSlides.bind(this, 0)}></span> 
          <span className={dot_class[1]} onClick={this.showSlides.bind(this, 1)}></span> 
          <span className={dot_class[2]} onClick={this.showSlides.bind(this, 2)}></span> 
          <span className={dot_class[3]} onClick={this.showSlides.bind(this, 3)}></span> 
          <span className={dot_class[4]} onClick={this.showSlides.bind(this, 4)}></span> 
        </div> 
      </div>
      
      </div>
    );
  }
}

export default Carousel;

