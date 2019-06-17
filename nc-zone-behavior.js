import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import moment from 'moment/src/moment.js';
import 'moment/src/locale/es.js';
import 'moment/src/locale/ca.js';
import {formatMoney} from 'accounting-js';

/* @polymerMixin */
let ncZoneBehavior = (base) =>
  class extends base {
    constructor() {
      super();
    }

    static get properties() {
      return {
        language: {
          type: String,
          observer: '_languageChanged'
        }
      }
    }

    _formatDate(date, language, format) {
      let lLanguage = (language) ? language : 'es';
      moment.locale(lLanguage);
      let lFormat = (format) ? format : "L";
      let dateText = "";
      if (date) {
        // Check "date" UTC
        if (date.substr(-1,1).toUpperCase() === "Z"){
          dateText = moment.utc(date).format(lFormat);
        } else {
          dateText = moment(date).format(lFormat);
        }
      }
      return dateText;
    }
    
    _formatTime(time, language) {
      let lLanguage = (language) ? language : 'es';
      moment.locale(lLanguage);
      let timeText = "";
      if (time) {
        // Check "time" UTC
        if (time.substr(-1,1).toUpperCase() === "Z"){
          timeText = moment.utc(time).format("HH:mm[h]");
        } else {
          timeText = moment(time).format("HH:mm[h]");
        }
      }
      return timeText;
    }

    _languageChanged(){
      if (typeof(moment)!="undefined") {
        moment.locale(this.language);
      }
    }

    _formatPrice(price) {
      let lPrice = (price) ? price : 0;
      let priceText = ""
      priceText = formatMoney(lPrice, {symbol: "€", precision: 2, thousand: ".", decimal: ",", format: "%v %s"});
      return priceText;
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
  };
  export const MixinZone = dedupingMixin(ncZoneBehavior);