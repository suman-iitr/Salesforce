import { LightningElement, api, track } from 'lwc';
 
export default class HierarchyModal extends LightningElement {
 
    @api items = [];
    @track filteredItems = [];
    @track filterValue = "";
    @track selectedItem;
    open = false;
    loaded = false;
    top;
    left;
    focus = {
        dropdownButton:false,
        card:false,
        tree:false
    };


    renderedCallback() {
        if (!this.loaded && this.items && this.items.length > 0) {

            let innerContainer = document.getElementsByClassName("layout-inner-container");

            if (innerContainer) {
                this.loaded = true;
            }

            this.loaded = true;
            this.filterList();
        }
    }

    @api
    changeModalVisibility(top, left) {
        this.top = top;
        this.left = left;
        this.open = !this.open;
        if(this.open==true){
            this.focus.dropdownButton = true;
            setTimeout(() => {
                this.template.querySelector("lightning-tree").focus();
            }, 100);
        }
    }

    @api
    dropDownButtonLostFocus() {
        this.focus.dropdownButton = false;
        this.handleFocusChange();
    }


    handleFilterChange(event) {
        this.filterValue = event.target.value;
        let searchTerm = event.target.value.toUpperCase();
        this.filterList(searchTerm);
    }

    filterList(searchTerm) {
		if (searchTerm && searchTerm.trim() != "") {
			this.filteredItems = this.filterItems(JSON.parse(JSON.stringify(this.items)), searchTerm.trim());
		}
		else {
			this.filteredItems = JSON.parse(JSON.stringify(this.items));
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
                            items[i].expanded=true;
							newItems.push(items[i]);
						}
					}
				}
			}
		}

		return newItems;
	}

    handleSelect(event) {
        this.selectedItem = event.detail.name;

        this.dispatchEvent(new CustomEvent("selected", { detail: this.selectedItem }));
    }

    @api
    clearFilter(stopPropagation) {
        this.filterValue = "";
        this.selectedItem = "";
        this.filterList(this.filterValue);        

        if (stopPropagation !== true) {
            this.dispatchEvent(new CustomEvent("selected", { detail: this.filterValue }));
        }
    }

    handleCardFocusOut(event) {
        this.focus.card=false;
        this.handleFocusChange();
    }
    handleCardFocusIn(event) {
        this.focus.card=true;
        this.handleFocusChange();
    }
    handleTreeFocusIn(event){
        this.focus.tree=true;
        this.handleFocusChange();
    }
    handleTreeFocusOut(event){
        this.focus.tree=false;
        this.handleFocusChange();
    }

    handleFocusChange()
    {
        setTimeout(() => {
            if(this.focus.card==false && this.focus.tree==false && this.focus.dropdownButton == false)
                {
                    this.open=false;
                }
                else
                {
                    this.open=true;
                }
            
        },100);
        
    }


    get modalPosition() {
        return `top: ${this.top ?? 0}px; left: ${this.left ?? 0}px`;
    }
}