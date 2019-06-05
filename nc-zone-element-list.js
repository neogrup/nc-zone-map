import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import { MixinZone } from './nc-zone-behavior.js';

class NcZoneElementList extends GestureEventListeners(MixinZone(PolymerElement)) {
  static get template() {
    return html`
      <style>
        :host{
          --element-content-background-color: transparent; /* normal: transparent, _o: #e8afaf, _p: #7fb2ff */
          --element-content-width: 100px;
          --element-content-height: 100px;
          --element-margin: 2px;
        }

        .element-container{
          position: relative;
          -webkit-touch-callout: none; /* iOS Safari */
          -webkit-user-select: none; /* Safari */
          -khtml-user-select: none; /* Konqueror HTML */
          -moz-user-select: none; /* Firefox */
          -ms-user-select: none; /* Internet Explorer/Edge */
          user-select: none; /* Non-prefixed version, currently
                                    supported by Chrome and Opera */
        }

        .element-content {
          border-radius: 5px;
          /* overflow: hidden; */
          position: relative;
          width: var(--element-content-width);
          height: var(--element-content-height);
          margin: var(--element-margin);
          cursor: pointer;
          border: 2px solid #5b91bd;
        }

        .default{
          border-color: #5b91bd;
          background-color: var(--element-content-background-color);
        }

        .element-content-header{
          background: #5b91bd;
          color: white;
          @apply --layout-horizontal;
          @apply --layout-center-justified;
        }

        .element-content-header-spot{
          font-size: 1.2em;
        }

        .item-content-body-center-full {
          position: absolute;
          top: 60%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .item-content-body-center-horizontal{
          position: absolute;
          top: 55%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .item-content-body-center-data{
          margin: 10px 5px;
          padding: 2px;
          font-weight: bold;
          font-size: 1.2em;
          background: linear-gradient(to bottom, rgba(255,255,255,0.5) 100%, rgba(255,255,255,0.5) 100%);
          border-radius: 5px;
        }

        .item-content-body-center-data:empty{
          padding: 0px;
          background: transparent;
        }
        
        .item-content-remaining-time-warning{
          position: relative;
          background-color: #FFC107;
          color: black;
          margin: 10px 5px;
          padding: 2px;
          font-weight: bold;
          font-size: 1.2em;
          border-radius: 5px;
        }

        .item-content-remaining-time-warning:empty{
          padding: 0px;
          background: transparent;
        }

        .item-content-remaining-time-alarm{
          position: relative;
          background-color: #F44336;
          color: white;
          margin: 10px 5px;
          padding: 2px;
          font-weight: bold;
          font-size: 1.2em;
          border-radius: 5px;
        }

        .item-content-remaining-time-alarm:empty{
          padding: 0px;
          background: transparent;
        }

        .item-content-remaining-time-ok{
          position: relative;
          background-color: #4CAF50;
          color: white;
          margin: 10px 5px;
          padding: 2px;
          font-weight: bold;
          font-size: 1.2em;
          border-radius: 5px;
        }

        .item-content-remaining-time-ok:empty{
          padding: 0px;
          background: transparent;
        }

        .item-content-doc-start-end{
          @apply --layout-horizontal;
          margin: 10px 5px;
          font-weight: bold;
          font-size: 1.2em;
        }

        .item-content-doc-start{
          padding: 2px;
          background: linear-gradient(to bottom, rgba(255,255,255,0.5) 100%, rgba(255,255,255,0.5) 100%);
          border-radius: 5px;
        }
        
        .item-content-doc-start:empty{
          padding: 0px;
          background: transparent;
        }

        .item-content-doc-end{
          margin-left: 10px;
          padding: 2px;
          background: linear-gradient(to bottom, rgba(255,255,255,0.5) 100%, rgba(255,255,255,0.5) 100%);
          border-radius: 5px;
        }

        .item-content-doc-end:empty{
          padding: 0px;
          background: transparent;
        }

        paper-ripple{
          color: #F44336;
        }
      </style>

      <template is="dom-if" if="{{showElement}}">

        <div class="element-container" on-mousedown="_mouseDown" on-mouseup="_mouseUp" on-mouseout="_mouseOut" on-touchstart="_touchStart" on-touchmove="_touchMove" on-touchend="_touchEnd">
          <div class="element-content default" _on-tap="_selectItem">
            <div class="element-content-header">
              <div class="element-content-header-spot">{{elementConf.id}}</div>
            </div>
            
            <template is="dom-if" if="[[elementSmall]]">
              <div class="item-content-body-center-full">
                <div class="item-content-body-center-data" hidden\$="{{_hideDiv('DELIVEREDPRODUCTS', spotsViewMode)}}">{{elementData.deliveredProducts}}</div>
                <div class="item-content-body-center-data" hidden\$="{{_hideDiv('AMOUNT', spotsViewMode)}}">{{elementData.totalAmount}}</div>
                <div class="item-content-body-center-data" hidden\$="{{_hideDiv('DOCID', spotsViewMode)}}">{{elementData.docId}}</div>
                <div class$="{{itemContentRemainingTimeClassName}}" hidden\$="{{_hideDiv('REMAININGTIME', spotsViewMode)}}">{{elementData.docRemainingTime}}</div>
              </div>
            </template>

            <template is="dom-if" if="[[elementBig]]">
              <div class="item-content-body-center-horizontal">
                <div class="item-content-body-center-data">{{elementData.docId}}</div>
                <div class$="{{itemContentRemainingTimeClassName}}" style="font-size: 1.5em;">{{elementData.docRemainingTime}}</div>
                <div class="item-content-doc-start-end">
                  <div class="item-content-doc-start">{{_formatTime(elementData.docStart)}}</div>
                  <div class="item-content-doc-end">{{_formatTime(elementData.docEnd)}}</div>
                </div>
              </div>
            </template>
          </div>
          <paper-ripple id="ripple" noink recenters initial-opacity="0.5" opacity-decay-velocity="0.5"></paper-ripple>
        </div>

      </template>
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
      systemTime: String,
      elementListWidth:{
        type: Number
      },
      elementListHeight:{
        type: Number
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

  _hideDiv(div, spotsViewMode){
    return (div !== spotsViewMode)
  }

  _elementConfChanged(){
    // Small buttons 70px
    if (this.elementListWidth <= 70){ 
      this.elementSmall = true;
      this.elementBig = false;
    } else {
      this.elementSmall = false;
      this.elementBig = true;
    }



    this.showElement = false;
    if (this.elementConf.customers != 0 ){
      this.showElement = true;
    }

    this.updateStyles({
      '--element-content-width': this.elementListWidth + 'px',
      '--element-content-height': this.elementListHeight + 'px',
    });
  }
  
  updateElement(element){
    let iDocs;
    let deliveredProducts = 0;
    let totalAmount = 0;
    let docId = '';
    let docStart = '';
    let docEnd = '';
    let remainingTime = '';
    this.itemContentRemainingTimeClassName = '';

    for (iDocs in element.docs){
      if (element.docs[iDocs].stats){
        deliveredProducts = deliveredProducts + element.docs[iDocs].stats.deliveredProducts;

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

      if (this.itemContentRemainingTimeClassName === 'item-content-remaining-time-alarm'){
        if (this.shadowRoot.querySelector('#ripple')){
          this.shadowRoot.querySelector('#ripple').simulatedRipple();
        }
      }
    }

    deliveredProducts = !isNaN(deliveredProducts) ? deliveredProducts : 0;

    this.set('elementData.deliveredProducts', deliveredProducts);
    this.set('elementData.totalAmount', totalAmount.toFixed(2));
    this.set('elementData.docId', docId);
    this.set('elementData.docStart', docStart);
    this.set('elementData.docEnd', docEnd);
    this.set('elementData.docRemainingTime', remainingTime);
    this.set('elementData.docsCount', Number(iDocs) + 1);
    this.set('elementData.docs', element.docs);

    /* TODO: proforma*/
    this.updateStyles({
      '--element-content-background-color': '#e8afaf'
    });
  }

  clearElement(){
    this.set('elementData.deliveredProducts', '');
    this.set('elementData.totalAmount', '');
    this.set('elementData.docId', '');
    this.set('elementData.docStart', '');
    this.set('elementData.docEnd', '');
    this.set('elementData.docRemainingTime', '');
    this.set('elementData.docsCount', 0);
    this.set('elementData.docs', []);

    this.updateStyles({
      '--element-content-background-color': 'transparent'
    });
  }
}

window.customElements.define('nc-zone-element-list', NcZoneElementList);
