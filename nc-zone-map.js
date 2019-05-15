import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import { GestureEventListeners } from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import './nc-zone-element.js';
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

        .zone-map{
          position: relative;
          height: 100%;
          width: 100%;
        }

        .element{
          position: absolute;
        }

      </style>

      <div class="zone-map">
        <template is="dom-repeat" items="{{elements}}" as="element">
          <nc-zone-element 
              id="slot{{data.id}}{{element.id}}"
              factor="{{factor}}"
              language="{{language}}"  
              element-conf="{{element}}" 
              editor-mode="{{editorMode}}" 
              mode="{{mode}}" 
              spots-view-mode="{{spotsViewMode}}" 
              multiple-tickets-allowed="{{multipleTicketsAllowed}}" 
              on-element-open-select-doc="_openSelectDoc" 
              on-element-selected="_elementSelected" 
              on-element-selected-to-move-end="_elementSelectedToMoveEnd">
          </nc-zone-element>
        </template>
      </div>
      
      <nc-zone-element-select-doc-dialog 
          id="selectDocDialog" 
          language="{{language}}" 
          on-element-selected="_elementSelected" 
          on-element-selected-to-move="_elementSelectedToMove">
      </nc-zone-element-select-doc-dialog>
    `;
  }

  static get properties() {
    return {
      language: String,
      data: {
        type: Object,
        value: {},
        observer: '_dataChanged'
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
      spotsViewMode: {
        type: String,
        reflectToAttribute: true
      },
      elements: {
        type: Array,
        value: []
      },
      multipleTicketsAllowed: Boolean,
      zoneHeight: {
        type: Number,
        observer: '_zoneHeightChanged'
      }

    }
  }

  connectedCallback(){
    super.connectedCallback();

    
  }
  _openSelectDoc(e){
    this.$.selectDocDialog.set('elementData', {});
    this.$.selectDocDialog.set('elementConf', {});
    this.$.selectDocDialog.set('elementData', e.detail.elementData);
    this.$.selectDocDialog.set('elementConf', e.detail.elementConf);
    this.$.selectDocDialog.open();
  }

  _zoneHeightChanged(){
    this._dataChanged();
  }

  _dataChanged() {
    let iElements;
    let slot;
    this.set('elements', []);
    if (Object.keys(this.data).length === 0) return;
    if (this.data.elements.length > 0) {
      this.set('elements', this.data.elements);
      for (iElements in this.data.elements){            
        slot = '#slot' + this.data.id + this.data.elements[iElements].id; 
        this.clearElement(slot);
      }
    }
    
    let factor = 1;
    if (this.zoneHeight < this.data.height){
      factor = this.data.height / this.zoneHeight;
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
        slot = '#slot' + this.data.id + this.data.elements[iElements].id; 
        this.clearElement(slot);
      }

      for (iZones in this.ticketsList.data.zones){            
        if (this.data.id === this.ticketsList.data.zones[iZones].id){
          for (iElements in this.ticketsList.data.zones[iZones].elements){
            slot = '#slot' + this.ticketsList.data.zones[iZones].id + this.ticketsList.data.zones[iZones].elements[iElements].id; 
            this.updateSpot(slot, this.ticketsList.data.zones[iZones].elements[iElements])
          }
        }
      }
    } else {
      for (iElements in this.data.elements){            
        slot = '#slot' + this.data.id + this.data.elements[iElements].id; 
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

  _elementSelectedToMoveEnd(e){
    let spot = e.detail.elementConf;
    this.dispatchEvent(new CustomEvent('zone-element-selected-to-move-end', {detail: {spot: spot}, bubbles: true, composed: true }));
  }
}

window.customElements.define('nc-zone-map', NcZoneMap);
