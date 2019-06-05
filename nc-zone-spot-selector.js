import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-a11y-keys/iron-a11y-keys.js';
import { AppLocalizeBehavior } from '@polymer/app-localize-behavior/app-localize-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { MixinZone } from './nc-zone-behavior.js';

class NcZoneSpotSelector extends mixinBehaviors([AppLocalizeBehavior], MixinZone(PolymerElement)) {
  static get template() {
    return html`
      <style>
        :host{}
         
        .container{
          padding: 5px;
        }

        .header{
          font-size: 1.2em;
          font-weight: bolder;
          height: 40px;
          line-height: 40px;
        }

        .content{
          @apply --layout-horizontal;
          @apply --layout-center;
          @apply --layout-center-justified;
        }

        paper-button{
          margin: 10px 5px;
          background-color: var(--app-secondary-color);
          color: white;
        }
      </style>

      <iron-a11y-keys id="a11ySignIn" keys="enter" on-keys-pressed="_accept"></iron-a11y-keys>
      <div class="container">
        <div class="header">{{localize('ZONE_SPOT_SELECTOR_TITLE')}}</div>
        <div class="content">
          <div>
            <paper-input id="spotSelector" value="{{spotSelected}}" type="number" required error-message="{{localize('INPUT_ERROR_REQUIRED')}}"></paper-input>
          </div>
          <div>
            <paper-button raised on-tap="_accept">{{localize('BUTTON_ACCEPT')}}</paper-button>  
          </div>
        </div>
        
      </div>
    `;
  }

  static get properties() {
    return {
      language: String,
      zoneData: {
        type: Object
      },
      ticketsList: {
        type: Object
      },
      elementConf: {
        type: Object,
        value: {}
      },
      elementData: {
        type: Object,
        value: {}
      },
    }
  }

  static get importMeta() { 
    return import.meta; 
  }
  

  connectedCallback(){
    super.connectedCallback();
    this.useKeyIfMissing = true;
    
    this.loadResources(this.resolveUrl('./static/translations.json'));
  }

  _accept(){
    // Clear elementData
    this.set('elementData.deliveredProducts', '');
    this.set('elementData.totalAmount', '');
    this.set('elementData.docId', '');
    this.set('elementData.docRemainingTime', '');
    this.set('elementData.docsCount', 0);
    this.set('elementData.docs', []);

    // Clear elementConf
    this.set('elementConf', {});

    // Check if spot is valid
    let spotSelectedFound = this.zoneData.elements.find(spot => spot.id === this.spotSelected);
    
    if (this._validate()){
      if (spotSelectedFound){
        if (spotSelectedFound.customers != 0){
          this.elementConf = JSON.parse(JSON.stringify(spotSelectedFound));
          
          if (this.ticketsList.data.zones.length > 0) {
            let ticketsListZoneFound = this.ticketsList.data.zones.find(zone => zone.id === this.zoneData.id);
            if (ticketsListZoneFound){

              let ticketsListSpotFound = ticketsListZoneFound.elements.find(spot => spot.id === this.spotSelected);
              if (ticketsListSpotFound){
                this.set('elementData.docs', ticketsListSpotFound.docs);
                this.dispatchEvent(new CustomEvent('element-open-select-doc', {detail: {elementConf: this.elementConf, elementData: this.elementData}, bubbles: true, composed: true }));
              } else {
                this.dispatchEvent(new CustomEvent('element-selected', {detail: {elementConf: this.elementConf}, bubbles: true, composed: true }));  
              }
            } else {
              this.dispatchEvent(new CustomEvent('element-selected', {detail: {elementConf: this.elementConf}, bubbles: true, composed: true }));
            }
          } else {
            this.dispatchEvent(new CustomEvent('element-selected', {detail: {elementConf: this.elementConf}, bubbles: true, composed: true }));
          }
        }
      } else{
        this.dispatchEvent(new CustomEvent('openToastError', {detail: {text: this.localize('MESSAGE_ERROR_ZONE_SPOT_SELECTOR_SPOT_NOT_FOUND')}, bubbles: true, composed: true }));
      }
    }
  }

  _validate(){
    let input = this.$.spotSelector;
    let inputInvalid = false;

    input.validate();
    
    if (input.invalid === true){
      this.$.spotSelector.focus();
      inputInvalid = true;
    }

    return !inputInvalid;
  }
}

window.customElements.define('nc-zone-spot-selector', NcZoneSpotSelector);
