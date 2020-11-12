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

        .spot-name-proforma{
          padding: 2px;
          background: #253855;
          color: white;
          border-radius: 5px;
        }

        .spot-name-produced-products-pf{
          padding: 2px;
          background: #2E7D32;
          color: white;
          border-radius: 5px;
        }

        .spot-name-closed-not-delivered{
          padding: 2px;
          background: #8E24AA;
          color: white; 
          /* background: #FFA726; 
          color: black;*/
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
            <div class$="{{spotIdClassName}}">{{elementConf.id}}</div>
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
      spotIdClassName: {
        type: String,
        value: ''
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
    let noProforma = 'N';
    let printProformaCount = 0;
    let printInvoiceCount = 0;
    let producedProductsPF = 0;
    let status = '';
    let docStatus = '';
    let docDelivered = '';
    this.spotIdClassName = 'spot-name';
    this.itemContentRemainingTimeClassName = '';
    this.hideProformaInvoice = true;
    

    for (iDocs in element.docs){
      if (element.docs[iDocs].stats){
        deliveredProducts = deliveredProducts + element.docs[iDocs].stats.deliveredProducts;
        noProforma = element.docs[iDocs].stats.noProforma;
        producedProductsPF = element.docs[iDocs].stats.producedProductsPF;
        printProformaCount = printProformaCount + element.docs[iDocs].stats.printProformaCount;
        printInvoiceCount = printInvoiceCount + element.docs[iDocs].stats.printInvoiceCount;
      }
      totalAmount = totalAmount + element.docs[iDocs].totalAmount;
      docId = (docId === '') ? element.docs[iDocs].id : '+' + (Number(iDocs) + 1).toString();
      docStatus = element.docs[iDocs].status;
      docDelivered = element.docs[iDocs].delivered;
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


    if (producedProductsPF > 0) {
      this.spotIdClassName = 'spot-name-produced-products-pf';
    } else {
      if ((docStatus == 'closed') && (docDelivered == 'N')){
        this.spotIdClassName = 'spot-name-closed-not-delivered';
      }
      else if (((printProformaCount > 0) || (printInvoiceCount > 0)) && (noProforma == 'N')){
        this.spotIdClassName = 'spot-name-proforma';
      }
    }


    deliveredProducts = !isNaN(deliveredProducts) ? deliveredProducts : 0;

    this.set('elementData.deliveredProducts', deliveredProducts);
    this.set('elementData.totalAmount', totalAmount.toFixed(2));
    this.set('elementData.docId', docId);
    this.set('elementData.docRemainingTime', remainingTime);
    this.set('elementData.docsCount', Number(iDocs) + 1);
    this.set('elementData.docs', element.docs);

    if (((printProformaCount > 0) || (printInvoiceCount > 0)) && (noProforma == 'N')) {
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
    this.spotIdClassName = 'spot-name';
    this.itemContentRemainingTimeClassName = '';
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
