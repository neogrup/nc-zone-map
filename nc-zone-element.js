import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import { MixinZone } from './nc-zone-behavior.js';

class NcZoneElement extends GestureEventListeners(MixinZone(PolymerElement)) {
  static get template() {
    return html`
      <style>
        :host{
          position: absolute;
          --pos-y: 0px;
          --pos-x: 0px;
          --url-image: "";
          --width: 0px;
          --height: 0px;
          --cursor: default;

          -webkit-touch-callout: none; /* iOS Safari */
          -webkit-user-select: none; /* Safari */
          -khtml-user-select: none; /* Konqueror HTML */
          -moz-user-select: none; /* Firefox */
          -ms-user-select: none; /* Internet Explorer/Edge */
          user-select: none; /* Non-prefixed version, currently
                                    supported by Chrome and Opera */
        }

        .image{
          position: relative;
          top: var(--pos-y);
          left: var(--pos-x);
          background-image: var(--url-image);
          background-size: 100% 100%;
          width: var(--width);
          height: var(--height);
          cursor: var(--cursor);  
          z-index: 99;
        }

        .element {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          visibility: var(--text-visibility);
          text-align: center;
        }

        .data{
          padding: 2px;
          font-weight: bold;
          font-size: 1.2em;
          /* background-color: rgba(255, 255, 255, 0.8); */
          /* border: 1px solid black; */
          background: linear-gradient(to bottom, rgba(255,255,255,0.5) 100%, rgba(255,255,255,0.5) 100%);
          border-radius: 5px;
        }

        .data:empty{
          padding: 0px;
          background: transparent;
        }

        .item-content-remaining-time-warning{
          background-color: #FFC107;
          color: black;
          padding: 2px;
          font-weight: bold;
          font-size: 1.2em;
          border-radius: 5px;
        }

        .item-content-remaining-time-alarm{
          background-color: #F44336;
          color: white;
          padding: 2px;
          font-weight: bold;
          font-size: 1.2em;
          border-radius: 5px;
        }
        .item-content-remaining-time-ok{
          background-color: #4CAF50;
          color: white;
          padding: 2px;
          font-weight: bold;
          font-size: 1.2em;
          border-radius: 5px;
        }
      </style>

      <div class="image" _on-track="handleTrack" on-mousedown="_mouseDown" on-mouseup="_mouseUp" on-mouseout="_mouseOut" on-touchstart="_touchStart" on-touchmove="_touchMove" on-touchend="_touchEnd">
        <div class="element">
          {{elementConf.id}}
          <div class="data" hidden\$="{{_hideDiv('DELIVEREDPRODUCTS', spotsViewMode)}}">{{elementData.deliveredProducts}}</div>
          <div class="data" hidden\$="{{_hideDiv('AMOUNT', spotsViewMode)}}">{{elementData.totalAmount}}</div>
          <div class="data" hidden\$="{{_hideDiv('DOCID', spotsViewMode)}}">{{elementData.docId}}</div>
          <div class$="{{itemContentRemainingTimeClassName}}" hidden\$="{{_hideDiv('REMAININGTIME', spotsViewMode)}}">{{elementData.docRemainingTime}}</div>
        </div>
        
      </div>
    `;
  }

  static get properties() {
    return {
      language: String,
      elementConf: {
        type: Object,
        value: {},
        observer: '_elementConfChanged'
      },
      elementData: {
        type: Object,
        value: {}
        //reflectToAttribute: true,
        //notify: true
      },
      editorMode: Boolean,
      mode: String,
      spotsViewMode: {
        type: String,
        value: ''
      },
      elementOffSetTop: Number,
      elementOffSetLeft: Number,
      multipleTicketsAllowed: {
        type: Boolean,
        value: true
      },
      factor: {
        type: Number,
        value: 1,
        observer: '_factorChanged'
      },
      itemContentRemainingTimeClassName: {
        type: String,
        value: ''
      },
    }
  }

  connectedCallback(){
    super.connectedCallback();
    this.elementData = {}
  }

  _factorChanged(){
    this._elementConfChanged();
  }

  _hideDiv(div, spotsViewMode){
    return (div !== spotsViewMode)
  }

  _elementConfChanged(){
    let cursor = 'default';
    let textVisibility = 'hidden';

    if (this.mode === 'edit'){
      cursor = 'move';
      textVisibility = 'visible';
    } else{
      if (this.elementConf.customers != 0 ){
        cursor = 'pointer';
        textVisibility = 'visible';
      }
    }


    this.updateStyles({
      '--width': this.elementConf.width / this.factor + 'px',
      '--height': this.elementConf.height / this.factor + 'px',
      '--url-image': 'url(' + this.elementConf.urlImage + ')',
      '--pos-y': ((this.elementConf.posY / this.factor) - ((this.elementConf.height / this.factor) / 2) ) + 'px',
      '--pos-x': ((this.elementConf.posX / this.factor) - ((this.elementConf.width / this.factor) / 2) ) +  'px',
      '--cursor': cursor,
      '--text-visibility': textVisibility
    });
  }

  updateElement(element){
    // element is an array of docs
    let iDocs;
    let deliveredProducts = 0;
    let totalAmount = 0;
    let docId = '';
    let docStart = '';
    let docEnd = '';
    let remainingTime = '';
    let proformPrinted = false;
    this.itemContentRemainingTimeClassName = '';

    for (iDocs in element.docs){
      if (element.docs[iDocs].stats){
        deliveredProducts = deliveredProducts + element.docs[iDocs].stats.deliveredProducts;

        proformPrinted = (proformPrinted) ? proformPrinted : (element.docs[iDocs].stats.printProformaCount > 0) ? true : false;

        if (element.docs[iDocs].stats.start){
          docStart = (docStart === '') ? element.docs[iDocs].stats.start : (docStart <= element.docs[iDocs].stats.start) ? docStart : element.docs[iDocs].stats.start;
        }
        if (element.docs[iDocs].stats.end){
          docEnd = (docEnd === '') ? element.docs[iDocs].stats.end : (docEnd >= element.docs[iDocs].stats.end) ? docEnd : element.docs[iDocs].stats.end;
        }
      }
      totalAmount = totalAmount + element.docs[iDocs].totalAmount;
      docId = (docId === '') ? element.docs[iDocs].id : '+' + (Number(iDocs) + 1).toString();
    }

    if ((docStart != '') && (docEnd != '')){
      remainingTime = this._getRemainingTime(this.systemTime, docStart, docEnd, 'time')
      this.itemContentRemainingTimeClassName = this._getRemainingTime(this.systemTime, docStart, docEnd, 'classname')
    }

    deliveredProducts = !isNaN(deliveredProducts) ? deliveredProducts : 0;

    this.set('elementData.deliveredProducts', deliveredProducts);
    this.set('elementData.totalAmount', totalAmount.toFixed(2));
    this.set('elementData.docId', docId);
    this.set('elementData.docRemainingTime', remainingTime);
    this.set('elementData.docsCount', Number(iDocs) + 1);
    this.set('elementData.docs', element.docs);

    if (proformPrinted){
      this.updateStyles({
        '--url-image': 'url(' + this.elementConf.urlImage.substring(1,this.elementConf.urlImage.lastIndexOf('.svg')) + '_p.svg' +')'
      });
    } else {
      this.updateStyles({
        '--url-image': 'url(' + this.elementConf.urlImage.substring(1,this.elementConf.urlImage.lastIndexOf('.svg')) + '_o.svg' +')'
      });
    }
    
  }

  clearElement(){
    this.set('elementData.deliveredProducts', '');
    this.set('elementData.totalAmount', '');
    this.set('elementData.docId', '');
    this.set('elementData.docRemainingTime', '');
    this.set('elementData.docsCount', 0);
    this.set('elementData.docs', []);

    this.updateStyles({
      '--url-image': 'url(' + this.elementConf.urlImage + ')'
    });
  }


  // handleTrack(e) {
  //   if(this.mode !== 'edit') return;
  //   switch(e.detail.state) {
  //     case 'start':
  //       this.elementOffSetTop = this.shadowRoot.querySelector('.image').offsetTop;
  //       this.elementOffsetLeft = this.shadowRoot.querySelector('.image').offsetLeft;
  //       break;
  //     case 'track':
  //         this.updateStyles({
  //           '--pos-y': (this.elementOffSetTop + e.detail.dy)  + 'px',
  //           '--pos-x': (this.elementOffsetLeft + e.detail.dx)  + 'px'
  //         });
  //       break;
  //     case 'end':
  //       /* TODO: Event or method to save the new position*/
  //       console.log('Element moved!')

  //       break;
  //   }
  // }
}

window.customElements.define('nc-zone-element', NcZoneElement);
