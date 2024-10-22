import { LightningElement, api, track } from 'lwc';
//import IMAGES from "@salesforce/resourceUrl/RevIntelImages";

const DROPDOWN_CLASSES = 'slds-is-open slds-dropdown-trigger slds-dropdown-trigger_click ';
const DROPDOWN_OPEN_CLASS = 'slds-is-open';

export default class Hierarchy extends LightningElement {
	//arrowImage = IMAGES + '/RevIntelImages/images/arrowDown.jpg';

	@api metadata;
	@api setSelection;
	@api selectMode;
	@api getState;
	@api setState;
	@track filteredItems = [];
	@track editabletitle;
    initialSelection;
	_selection;
	cardStyle = "";
	manuallySelected = false;

	@track dropdownOpen = false;

	toggle = false;

	@track showModal = false;

	renderedCallback() {
		console.log('renderedCallback');
	}

	connectedCallback() {
		console.log('connectedCallback');
	}
 
	openModal() {
		let cardPosition = this.template.querySelector("lightning-card").getBoundingClientRect();
		let top = cardPosition.top + 30;
		let left = cardPosition.left;

		let modal = this.template.querySelector("c-hierarchy-modal");
		modal.changeModalVisibility(top, left);
	}

	onFocusOut() {
		let modal = this.template.querySelector("c-hierarchy-modal");
		modal.dropDownButtonLostFocus();
	}

	handleOnClick(event){
		this.dropdownOpen = !this.dropdownOpen;
	}

	handleFilterChange(event) {
		let searchTerm = event.target.value.toUpperCase();
		
		if (searchTerm && searchTerm.trim() != "") {
			this.filteredItems = this.filterItems(JSON.parse(JSON.stringify(this._items)), searchTerm.trim());
		}
		else {
			this.filteredItems = JSON.parse(JSON.stringify(this._items));
		}
	}

	filterItems(items, searchTerm) {
		let newItems = [];
		if (items) {
			for (let i in items) {
				if (items[i].label) {
					if (items[i].label.toUpperCase().includes(searchTerm)) {
						newItems.push(items[i]);
					}
					else if (items[i].items && items[i].items.length > 0){
						items[i].items = this.filterItems(items[i].items, searchTerm);
						if (items[i].items.length > 0) {
							newItems.push(items[i]);
						}
					}
				}
			}
		}

		return newItems;
	}

	@api
	get title() {
		return this._title;
	}

	set title(value) {
		this._title = value == undefined ? '' : value;
		this.editabletitle = this._title;
	}

	@api
	get results() {
		return this._results;
	}

	set results(results) {  	
		this._results = results;
		this.items = this.getItems();
	}

	@api
	get idColumn() {
		return this._idColumn;
	}

	set idColumn(idColumn) {
		this._idColumn = idColumn;
		this.items = this.getItems();
	}

	
	@api
	get selection() {
		return this._selection;
	}

	set selection(value) {

		this._selection = value;

		if (value && value.length > 0 && this.idColumn) {
			if (!this.initialSelection && this.manuallySelected == false) {
				this.initialSelection = JSON.parse(JSON.stringify(value));
			}
			else if (this.initialSelection && this.initialSelection.length > 0 && value[0].AltPayeeID == this.initialSelection[0].AltPayeeID) {
				this.refs.hierarchyModal.clearFilter(true);
			}
			
			this.editabletitle = `${this.title} ${value[0]?.name}`;
		}
		else { 
			this.editabletitle = this.title;
		}
	}

	@api
	get parentIdColumn() {
		return this._parentIdColumn;
	}

	set parentIdColumn(parentIdColumn) {
		this._parentIdColumn = parentIdColumn;
		this.items = this.getItems();
	}

	@api
	get labelColumn() {
		return this._labelColumn;
	}

	set labelColumn(labelColumn) {
		this._labelColumn = labelColumn;
		this.items = this.getItems();
	}

	@api
	get root() {
		return this._root;
	}

	set root(root) {
		this._root = root;
		this.items = this.getItems();
	}

	get items() {
		return this._items;
	}

	set items(value) {
		this._items = value;
		this.filteredItems = JSON.parse(JSON.stringify(value));
	}

	get classNames() {
		return DROPDOWN_CLASSES + (this.dropdownOpen == true ? DROPDOWN_OPEN_CLASS : "");
	}

  	/**
 	* Process flat list of results into hierarchical structure expected by the tree grid component.
	*/
	getItems() {
		if (this.results == null) {
			return [];
		}

		const rowsByParent = new Map();

		this.results.forEach((row) => {
			const parentId = row[this.parentIdColumn];

			rowsByParent.set(parentId, (rowsByParent.get(parentId) || []).concat(row));
		});

		return this._collectNodes(rowsByParent, this.root != null ? this.root : null);
	}

	handleSelect(event) {
		let selectedvalue = event.detail != "" ? this.results.filter((row) => row[this.idColumn] === event.detail) : this.initialSelection;

		this.manuallySelected = true;

		if (!selectedvalue) {
			selectedvalue = [];
		}
		
		this.setSelection(selectedvalue);
	}

	/**
	 * Collect nodes with a given parent ID as well as their children, recursively.
	 */
	_collectNodes(rowsByParent, parentId) {
		return (rowsByParent.get(parentId) || []).map((row) => {
			return {
				label: row[this.labelColumn],
				name: row[this.idColumn],
				items: this._collectNodes(rowsByParent, row[this.idColumn])
			};
		});
	}
}