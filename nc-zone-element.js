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

        .spot{
          @apply --layout-horizontal;
          @apply --layout-center-justified;
          @apply --layout-center-center;
        }

        .spot-name{
          padding: 2px;
          background: linear-gradient(to bottom, rgba(255,255,255,0.5) 100%, rgba(255,255,255,0.5) 100%);
          border-radius: 5px;
        }

        .data{
          padding: 2px;
          font-weight: bold;
          font-size: 1.2em;
          background: linear-gradient(to bottom, rgba(255,255,255,0.5) 100%, rgba(255,255,255,0.5) 100%);
          border-radius: 5px;
        }

        .data:empty{
          padding: 0px;
          background: transparent;
        }

        .proforma-invoice  {
          width: 16px;
          margin-left: 2px;
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
          <div class="spot">
            <div class="spot-name">{{elementConf.id}}</div>
            <div class="proforma-invoice" hidden\$="{{hideProformaInvoice}}">
              <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="file-invoice-dollar" class="svg-inline--fa fa-file-invoice-dollar fa-w-12" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M377 105L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128v-6.1c0-6.3-2.5-12.4-7-16.9zm-153 31V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zM64 72c0-4.42 3.58-8 8-8h80c4.42 0 8 3.58 8 8v16c0 4.42-3.58 8-8 8H72c-4.42 0-8-3.58-8-8V72zm0 80v-16c0-4.42 3.58-8 8-8h80c4.42 0 8 3.58 8 8v16c0 4.42-3.58 8-8 8H72c-4.42 0-8-3.58-8-8zm144 263.88V440c0 4.42-3.58 8-8 8h-16c-4.42 0-8-3.58-8-8v-24.29c-11.29-.58-22.27-4.52-31.37-11.35-3.9-2.93-4.1-8.77-.57-12.14l11.75-11.21c2.77-2.64 6.89-2.76 10.13-.73 3.87 2.42 8.26 3.72 12.82 3.72h28.11c6.5 0 11.8-5.92 11.8-13.19 0-5.95-3.61-11.19-8.77-12.73l-45-13.5c-18.59-5.58-31.58-23.42-31.58-43.39 0-24.52 19.05-44.44 42.67-45.07V232c0-4.42 3.58-8 8-8h16c4.42 0 8 3.58 8 8v24.29c11.29.58 22.27 4.51 31.37 11.35 3.9 2.93 4.1 8.77.57 12.14l-11.75 11.21c-2.77 2.64-6.89 2.76-10.13.73-3.87-2.43-8.26-3.72-12.82-3.72h-28.11c-6.5 0-11.8 5.92-11.8 13.19 0 5.95 3.61 11.19 8.77 12.73l45 13.5c18.59 5.58 31.58 23.42 31.58 43.39 0 24.53-19.05 44.44-42.67 45.07z"></path></svg>
            </div>
          </div>
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
      hideProformaInvoice: {
        type: Boolean,
        value: true
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
    let remainingTime = '';
    let printProformaCount = 0;
    let printInvoiceCount = 0;
    this.itemContentRemainingTimeClassName = '';
    this.hideProformaInvoice = true;
    

    for (iDocs in element.docs){
      if (element.docs[iDocs].stats){
        deliveredProducts = deliveredProducts + element.docs[iDocs].stats.deliveredProducts;
        printProformaCount = printProformaCount + element.docs[iDocs].stats.printProformaCount;
        printInvoiceCount = printInvoiceCount + element.docs[iDocs].stats.printInvoiceCount;
      }
      totalAmount = totalAmount + element.docs[iDocs].totalAmount;
      docId = (docId === '') ? element.docs[iDocs].id : '+' + (Number(iDocs) + 1).toString();
    }

    if (element.stats){
      if (element.stats.remainingTime){
        remainingTime = element.stats.remainingTime;
      }
      if (element.stats.status){
        status = element.stats.status;
        switch (status) {
          case 'NONE':
            this.itemContentRemainingTimeClassName = 'item-content-remaining-time-ok';
            remainingTime = remainingTime +  "'";
            break;
          case 'WARNING':
            this.itemContentRemainingTimeClassName = 'item-content-remaining-time-warning';
            remainingTime = remainingTime +  "'";
            break;
          case 'ERROR':
            this.itemContentRemainingTimeClassName = 'item-content-remaining-time-alarm';
            remainingTime = '+' + Math.abs(remainingTime) + "'";
            if (this.shadowRoot.querySelector('#ripple')){
              this.shadowRoot.querySelector('#ripple').simulatedRipple();
            }
            break;
          default:
            break;
        }
      }
    }

    deliveredProducts = !isNaN(deliveredProducts) ? deliveredProducts : 0;

    this.set('elementData.deliveredProducts', deliveredProducts);
    this.set('elementData.totalAmount', totalAmount.toFixed(2));
    this.set('elementData.docId', docId);
    this.set('elementData.docRemainingTime', remainingTime);
    this.set('elementData.docsCount', Number(iDocs) + 1);
    this.set('elementData.docs', element.docs);

    if ((printProformaCount > 0)|| (printInvoiceCount > 0)) {
      this.hideProformaInvoice = false;
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
    this.hideProformaInvoice = true;

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
