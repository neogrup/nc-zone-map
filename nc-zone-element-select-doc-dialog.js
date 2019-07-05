import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/neon-animation/neon-animation.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { AppLocalizeBehavior } from '@polymer/app-localize-behavior/app-localize-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { MixinZone } from './nc-zone-behavior.js';

class NcZoneElementSelectDocDialog extends mixinBehaviors([AppLocalizeBehavior], MixinZone(PolymerElement)) {
  static get template() {
    return html`
      <style>
      </style>

      <paper-dialog id="selectDocDialog" class="modalNoApp" modal entry-animation="scale-up-animation" dialog>
        <div class="header">
          <iron-icon icon="content-copy"></iron-icon><h3>{{localize('ELEMENT_SELECT_DOC_DIALOG_TITLE')}}</h3>
        </div>
        <paper-dialog-scrollable>
          <div class="actions-list">
            <template is="dom-repeat" items="{{elementData.docs}}" as="doc">
              
              <div class="line">
                <div class="line-container" on-tap="_docSelected">
                  <div class="line-doc-id">#[[doc.id]]</div>
                  <div class="line-doc-edited">{{_formatTime(doc.edited)}}</div>
                  <div class="line-doc-amount">[[_formatPrice(doc.totalAmount)]]</div>
                </div>
                <div class="line-actions">
                  <paper-icon-button icon="open-with" drawer-toggle hidden$="{{hideMoveDocButton}}" on-tap="_moveDoc"></paper-icon-button>
                  <paper-icon-button icon="print" drawer-toggle hidden$="{{!showPrintTicketButton}}" on-tap="_printDoc"></paper-icon-button>
                </div>
              </div>
            </template>
          </div>
        </paper-dialog-scrollable>

        <div class="buttons">
          <paper-button raised on-tap="_newDoc"><iron-icon icon="add"></iron-icon>{{localize('BUTTON_NEW')}}</paper-button>
          <paper-button raised dialog-dismiss>{{localize('BUTTON_CLOSE')}}</paper-button>
        </div>
      </paper-dialog>
    `;
  }

  static get properties() {
    return {
      language: String,
      elementConf: Object,
      elementData: Object,
      mapViewMode: {
        type: String
      },
      hideMoveDocButton: Boolean
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

  open(){
    /* Fix Modal paper-dialog appears behind its backdrop */
    var app = document.querySelector('body').firstElementChild.shadowRoot;
    dom(app).appendChild(this.$.selectDocDialog);

    this.hideMoveDocButton = (this.mapViewMode === 'MAPSELECTOR') ? true : false;

    this.$.selectDocDialog.open();

    
  }

  _newDoc(e){
    this.dispatchEvent(new CustomEvent('element-selected', {detail: {elementConf: this.elementConf}, bubbles: true, composed: true }));
    this.elementConf = {};
    this.elementData = {};
    this.$.selectDocDialog.close();
  }

  _docSelected(e){
    this.dispatchEvent(new CustomEvent('element-selected', {detail: {elementConf: this.elementConf, ticketId: e.model.doc.id}, bubbles: true, composed: true }));
    this.elementConf = {};
    this.elementData = {};
    this.$.selectDocDialog.close();
  }

  _moveDoc(e){
    this.dispatchEvent(new CustomEvent('element-selected-to-move', {detail: {elementConf: this.elementConf, ticketId: e.model.doc.id}, bubbles: true, composed: true }));
    this.elementConf = {};
    this.elementData = {};
    this.$.selectDocDialog.close();
  }

  _printDoc(e){
    this.dispatchEvent(new CustomEvent('element-selected-to-print', {detail: {elementConf: this.elementConf, ticketId: e.model.doc.id}, bubbles: true, composed: true }));
    this.elementConf = {};
    this.elementData = {};
    this.$.selectDocDialog.close();
  }
}

window.customElements.define('nc-zone-element-select-doc-dialog', NcZoneElementSelectDocDialog);
