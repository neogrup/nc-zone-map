import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';

class NcZoneElement extends GestureEventListeners(PolymerElement) {
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
          font-weight: bold;
          font-size: 1.2em;
          /* background-color: rgba(255, 255, 255, 0.8); */
          /* border: 1px solid black; */
          background: linear-gradient(to bottom, rgba(255,255,255,0.5) 100%, rgba(255,255,255,0.5) 100%);
          border-radius: 5px;
        }
      </style>

      <div class="image" _on-track="handleTrack" on-mousedown="_mouseDown" on-mouseup="_mouseUp" on-mouseout="_mouseOut" on-touchstart="_touchStart" on-touchmove="_touchMove" on-touchend="_touchEnd">
        <div class="element">
          {{elementConf.id}}
          <div class="data" hidden\$="{{_hideDiv('DELIVEREDPRODUCTS', spotsViewMode)}}">
            {{elementData.deliveredProducts}}
          </div>
          <div class="data" hidden\$="{{_hideDiv('AMOUNT', spotsViewMode)}}">
            {{elementData.totalAmount}}
          </div>
          <div class="data" hidden\$="{{_hideDiv('DOCID', spotsViewMode)}}">
            {{elementData.docId}}
          </div>
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
      }
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

    for (iDocs in element.docs){
      if (element.docs[iDocs].stats){
        deliveredProducts = deliveredProducts + element.docs[iDocs].stats.deliveredProducts;
      }
      totalAmount = totalAmount + element.docs[iDocs].totalAmount;
      docId = (docId === '') ? element.docs[iDocs].id : '+' + (Number(iDocs) + 1).toString();
    }

    deliveredProducts = !isNaN(deliveredProducts) ? deliveredProducts : 0;

    this.set('elementData.deliveredProducts', deliveredProducts);
    this.set('elementData.totalAmount', totalAmount.toFixed(2));
    this.set('elementData.docId', docId);
    this.set('elementData.docsCount', Number(iDocs) + 1);
    this.set('elementData.docs', element.docs);

    /* TODO: proforma*/
    this.updateStyles({
      '--url-image': 'url(' + this.elementConf.urlImage.substring(1,this.elementConf.urlImage.lastIndexOf('.svg')) + '_o.svg' +')'
    });
  }

  clearElement(){
    this.set('elementData.deliveredProducts', '');
    this.set('elementData.totalAmount', '');
    this.set('elementData.docId', '');
    this.set('elementData.docsCount', 0);
    this.set('elementData.docs', []);

    this.updateStyles({
      '--url-image': 'url(' + this.elementConf.urlImage + ')'
    });
  }

  _mouseDown(e){
    if (e.button !== 0) return;
    // console.log('_mouseDown');
    // Only desktop
    if ((typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1)) return;

    this._debouncer = Debouncer.debounce(
      this._debouncer,
      timeOut.after(1000),
      () => {
        this._elementSelected('pressed');
      }
    );
  }

  _mouseUp(e){
    if (e.button !== 0) return;
    // console.log('_mouseUp');
    // Only desktop
    if ((typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1)) return;

    if (this._debouncer){
      if (this._debouncer._timer) {
        this._debouncer.cancel();
        this._elementSelected('clicked');
      }
    }
  }

  _mouseOut(e){
    if (e.button !== 0) return;
    if (this._debouncer){
      if (this._debouncer._timer) {
        this._debouncer.cancel();
      }
    }
  }

  _touchStart(e){
    this._debouncer = Debouncer.debounce(
      this._debouncer,
      timeOut.after(1000),
      () => {
        this._elementSelected('pressed');
      }
    );
  }

  _touchMove(e){
    if (this._debouncer){
      if (this._debouncer._timer) {
        this._debouncer.cancel();
      }
    }
  }


  _touchEnd(e){
    if (this._debouncer._timer) {
      this._debouncer.cancel();
      this._elementSelected('clicked');
    }
  }

  _elementSelected(selectMode){
    if(this.mode == 'edit') return;

    if (this.editorMode){
      /* TODO: Maybe manage editorModeType, p.e. moveTicket, etc. */
      this.dispatchEvent(new CustomEvent('element-selected-to-move-end', {detail: {elementConf: this.elementConf}, bubbles: true, composed: true }));
    } else{
      if ((!this.elementData.docsCount) || (this.elementData.docsCount === 0)){
        this.dispatchEvent(new CustomEvent('element-selected', {detail: {elementConf: this.elementConf}, bubbles: true, composed: true }));
      } else{
        if (this.elementData.docsCount === 1) {
          if ((this.multipleTicketsAllowed) && (selectMode === 'pressed')){  
            this.dispatchEvent(new CustomEvent('element-open-select-doc', {detail: {elementConf: this.elementConf, elementData: this.elementData}, bubbles: true, composed: true }));
          } else {
            this.dispatchEvent(new CustomEvent('element-selected', {detail: {elementConf: this.elementConf, ticketId: this.elementData.docId}, bubbles: true, composed: true }));
          }
        } else{
          this.dispatchEvent(new CustomEvent('element-open-select-doc', {detail: {elementConf: this.elementConf, elementData: this.elementData}, bubbles: true, composed: true }));
        }
      }
    }
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
