import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import './nc-zone-element.js';
import './nc-zone-element-list.js';
import './nc-zone-spot-selector.js';
import './nc-zone-element-select-doc-dialog.js';

class NcZoneMap extends GestureEventListeners(PolymerElement) {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          overflow: auto;
        }

        .container{
          position: relative;
          height: 100%;
          width: 100%;
        }

        .zone-map-list{
          @apply --layout-horizontal;
          @apply --layout-wrap;
          padding: 5px;
        }
      </style>

      <div class="container" hidden$="{{hideZoneElement}}">
        <template is="dom-repeat" items="{{elements}}" as="element">
            <nc-zone-element 
                id="{{_getSlotId('slot',element.id)}}"
                factor="{{factor}}"
                language="{{language}}"  
                element-conf="{{element}}" 
                editor-mode="{{editorMode}}" 
                mode="{{mode}}" 
                spots-view-mode="{{spotsViewMode}}" 
                multiple-tickets-allowed="{{multipleTicketsAllowed}}" 
                system-time="{{ticketsList.systemTime}}"
                on-element-open-select-doc="_openSelectDoc" 
                on-element-selected="_elementSelected" 
                on-element-selected-to-move-end="_elementSelectedToMoveEnd">
            </nc-zone-element>
        </template>
      </div>

      <div class="container" hidden$="{{hideZoneElementList}}">
        <div class="zone-map-list">
          <template is="dom-repeat" items="{{elements}}" as="element">
            <nc-zone-element-list
                id="{{_getSlotId('slotList',element.id)}}"
                language="{{language}}"  
                element-conf="{{element}}" 
                element-list-width="{{elementListWidth}}"
                element-list-height="{{elementListHeight}}"
                editor-mode="{{editorMode}}" 
                mode="{{mode}}" 
                spots-view-mode="{{spotsViewMode}}" 
                multiple-tickets-allowed="{{multipleTicketsAllowed}}" 
                system-time="{{ticketsList.systemTime}}"
                on-element-open-select-doc="_openSelectDoc" 
                on-element-selected="_elementSelected" 
                on-element-selected-to-move-end="_elementSelectedToMoveEnd">
            </nc-zone-element-list>
          </template>
        </div>
      </div>

      <div class="container" hidden$="{{hideZoneElementSelector}}">
        <nc-zone-spot-selector
            language="{{language}}"
            zone-data="{{data}}"
            tickets-list="{{ticketsList}}"
            on-element-open-select-doc="_openSelectDoc" 
            on-element-selected="_elementSelected">
        </nc-zone-spot-selector>
      </div>
      
      <nc-zone-element-select-doc-dialog 
          id="selectDocDialog" 
          language="{{language}}" 
          map-view-mode={{mapViewMode}}
          show-print-ticket-button="{{showPrintTicketButton}}"
          on-element-selected="_elementSelected" 
          on-element-selected-to-move="_elementSelectedToMove"
          on-element-selected-to-print="_elementSelectedToPrint">
      </nc-zone-element-select-doc-dialog>
    `;
  }

  static get properties() {
    return {
      language: String,
      data: {
        type: Object,
        value: {},
        _observer: '_dataChanged'
      },
      ticketLoading: {
        type: Boolean,
        notify: true
      },
      ticketsList: {
        type: Object,
        value: {},
        observer: '_ticketsListChanged'
      },
      editorMode: Boolean,
      mode: {
        type: String,
        value: 'edit'
      },
      mapViewMode: {
        type: String,
        reflectToAttribute: true,
        value: 'MAPFIT'
      },
      spotsViewMode: {
        type: String,
        reflectToAttribute: true,
      },
      elements: {
        type: Array,
        value: []
      },
      multipleTicketsAllowed: Boolean,
      zoneHeight: Number,
      zoneWidth: Number,
      elementListWidth:{
        type: Number,
        value: 100,
        reflectToAttribute: true,
      },
      elementListHeight:{
        type: Number,
        value: 100,
        reflectToAttribute: true
      },
      hideZoneElement: {
        type: Boolean,
        reflectToAttribute: true,
        value: false
      },
      hideZoneElementList: {
        type: Boolean,
        reflectToAttribute: true,
        value: false
      },
      hideZoneElementSelector: {
        type: Boolean,
        reflectToAttribute: true,
        value: false
      },
      showPrintTicketButton: {
        type: Boolean,
        value: false
      }
    }
  }

  static get observers() {
    return [
      '_zoneDimensionChanged(zoneHeight, zoneWidth, mapViewMode)'
    ];
  }

  connectedCallback(){
    super.connectedCallback();
    
  }

  _getSlotId(prefix, elementId){
    let spotId = prefix + this.data.id + elementId.replace(/ /g, "_");
    return spotId
  }

  _openSelectDoc(e){
    this.$.selectDocDialog.set('elementData', {});
    this.$.selectDocDialog.set('elementConf', {});
    this.$.selectDocDialog.set('elementData', e.detail.elementData);
    this.$.selectDocDialog.set('elementConf', e.detail.elementConf);
    this.$.selectDocDialog.open();
  }

  _zoneDimensionChanged(){
    switch (this.mapViewMode) {
      case 'MAPFIT':
        this.hideZoneElement = false;
        this.hideZoneElementList = true;
        this.hideZoneElementSelector = true;  
        break;
      case 'MAPSCROLL':
        this.hideZoneElement = false;
        this.hideZoneElementList = true;
        this.hideZoneElementSelector = true;  
        break;
      case 'MAPLIST':
        this.hideZoneElement = true;
        this.hideZoneElementList = false;
        this.hideZoneElementSelector = true;
        break;

      case 'MAPSELECTOR':
          this.hideZoneElement = true;
          this.hideZoneElementList = true;
          this.hideZoneElementSelector = false;
        break;
      default:
        break;
    }

    this._dataChanged();
    this._ticketsListChanged();
  }

  _dataChanged() {
    let iElements;
    let slot;
    this.set('elements', []);
    if (Object.keys(this.data).length === 0) return;
    if (this.data.elements.length > 0) {
      this.set('elements', this.data.elements);
      for (iElements in this.data.elements){        
        if ((this.mapViewMode == 'MAPFIT') || (this.mapViewMode == 'MAPSCROLL')) {    
          slot = '#slot' + this.data.id + this.data.elements[iElements].id.replace(/ /g, "_"); 
        }

        if (this.mapViewMode == 'MAPLIST') {
          slot = '#slotList' + this.data.id + this.data.elements[iElements].id.replace(/ /g, "_"); 
        }

        this.clearElement(slot);

      }
    }
    
    let factor = 1;
    
    if (this.mapViewMode == 'MAPFIT') {
      if ((this.data.width / this.zoneWidth) > (this.data.height / this.zoneHeight) ){
        factor = this.data.width / this.zoneWidth;
      } else{
        factor = this.data.height / this.zoneHeight;
      }
      
    }

    if (this.mapViewMode == 'MAPSCROLL') {
      if (this.zoneHeight < this.data.height){
        factor = this.data.height / this.zoneHeight;
      }
    }
    
    this.factor = factor;
  }

  _ticketsListChanged(){
    let iZones;
    let iElements;
    let slot;

    if (!this.ticketsList) return;
    if (Object.keys(this.ticketsList).length === 0) return;

    if (this.ticketsList.data.zones.length > 0) {
      for (iElements in this.data.elements){            
        if ((this.mapViewMode == 'MAPFIT') || (this.mapViewMode == 'MAPSCROLL')) {    
          slot = '#slot' + this.data.id + this.data.elements[iElements].id.replace(/ /g, "_"); 
        }

        if (this.mapViewMode == 'MAPLIST') {
          slot = '#slotList' + this.data.id + this.data.elements[iElements].id.replace(/ /g, "_"); 
        }
        this.clearElement(slot);
      }

      for (iZones in this.ticketsList.data.zones){            
        if (this.data.id === this.ticketsList.data.zones[iZones].id){
          for (iElements in this.ticketsList.data.zones[iZones].elements){
            if ((this.mapViewMode == 'MAPFIT') || (this.mapViewMode == 'MAPSCROLL')) {    
              slot = '#slot' + this.ticketsList.data.zones[iZones].id + this.ticketsList.data.zones[iZones].elements[iElements].id.replace(/ /g, "_"); 
            } 
            if (this.mapViewMode == 'MAPLIST') {
              slot = '#slotList' + this.ticketsList.data.zones[iZones].id + this.ticketsList.data.zones[iZones].elements[iElements].id.replace(/ /g, "_"); 
            }
            this.updateSpot(slot, this.ticketsList.data.zones[iZones].elements[iElements])
          }
        }
      }
    } else {
      for (iElements in this.data.elements){            
        if ((this.mapViewMode == 'MAPFIT') || (this.mapViewMode == 'MAPSCROLL')) {    
          slot = '#slot' + this.data.id + this.data.elements[iElements].id.replace(/ /g, "_"); 
        }

        if (this.mapViewMode == 'MAPLIST') {
          slot = '#slotList' + this.data.id + this.data.elements[iElements].id.replace(/ /g, "_"); 
        }

        this.clearElement(slot);
      }
    }
  }

  updateSpot(slot, element){
    if (this.shadowRoot.querySelector(slot)){
      this.shadowRoot.querySelector(slot).updateElement(element);
    }
  }

  clearElement(slot){
    if (this.shadowRoot.querySelector(slot)){
      this.shadowRoot.querySelector(slot).clearElement();
    }
  }

  _elementSelected(e){
    if (!this.ticketLoading){
      let spot = e.detail.elementConf;
      let ticketId = e.detail.ticketId;
      if (spot.customers != 0 ){
        this.ticketLoading = true;
        this.dispatchEvent(new CustomEvent('zone-element-selected', {detail: {spot: spot, ticketId: ticketId}, bubbles: true, composed: true }));
      }
    }
  }

  _elementSelectedToMove(e){
    if (!this.ticketLoading){
      let spot = e.detail.elementConf;
      let ticketId = e.detail.ticketId;
      this.dispatchEvent(new CustomEvent('zone-element-selected-to-move', {detail: {spot: spot, ticketId: ticketId}, bubbles: true, composed: true }));
    }
  }

  _elementSelectedToPrint(e){
    if (!this.ticketLoading){
      let spot = e.detail.elementConf;
      let ticketId = e.detail.ticketId;
      this.dispatchEvent(new CustomEvent('zone-element-selected-to-print', {detail: {spot: spot, ticketId: ticketId}, bubbles: true, composed: true }));
    }
  }

  _elementSelectedToMoveEnd(e){
    let spot = e.detail.elementConf;
    if (spot.customers != 0 ){
      this.dispatchEvent(new CustomEvent('zone-element-selected-to-move-end', {detail: {spot: spot}, bubbles: true, composed: true }));
    }
  }
}

window.customElements.define('nc-zone-map', NcZoneMap);
