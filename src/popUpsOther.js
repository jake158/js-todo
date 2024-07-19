

export class newProjectPopup {
    constructor(parent) {
        this.p = parent;
    }

    initializePopup(callback) {
        this.callback = callback;
        this.p.innerHTML = `
        <div class="popup">
            <div class="subheader">
                <h2>New Project</h2>
                <button class="x-btn" id="close-button">x</button>
            </div>
            <div class="form-group">
                <label for="title">Title</label>
                <input type="text" id="title" name="title">
            </div>
            <div class="form-group">
                <button id="save-button">Save</button>
            </div>
        </div>
        `
        this.title = this.p.querySelector('#title');

        this.saveButton = this.p.querySelector('#save-button');
        this.saveButton.addEventListener('click', () => this.popupClosed());

        this.closeButton = this.p.querySelector('#close-button');
        this.closeButton.addEventListener('click', () => this.hide());
    }

    show(callback) {
        this.initializePopup(callback);
        this.p.classList.add('show');
    }

    hide() {
        this.p.classList.remove('show');
    }

    popupClosed() {
        this.hide();
        this.callback(this.title.value);
    }
}


export class confirmPopup {
    constructor(parent) {
        this.p = parent;
    }

    initializePopup(message, callback) {
        this.callback = callback;
        this.p.innerHTML = `
        <div class="popup">
            <div class="subheader">
                <h2>${message}</h2>
                <button class="x-btn" id="close-button">x</button>
            </div>
            <div class="form-group confirm-reject">
                <button id="confirm-button">Yes</button>
                <button id="reject-button">No</button>
            </div>
        </div>
        `
        this.closeButton = this.p.querySelector('#close-button');
        this.closeButton.addEventListener('click', () => this.hide());

        this.confirmButton = this.p.querySelector('#confirm-button');
        this.confirmButton.addEventListener('click', () => this.confirmed());

        this.rejectButton = this.p.querySelector('#reject-button');
        this.rejectButton.addEventListener('click', () => this.hide());
    }

    show(message, callback) {
        this.initializePopup(message, callback);
        this.p.classList.add('show');
    }

    hide() {
        this.p.classList.remove('show');
    }

    confirmed() {
        this.hide();
        this.callback();
    }
}


export class errorPopup {
    constructor(parent) {
        this.p = parent;
    }

    initializePopup(message) {
        this.p.innerHTML = `
        <div class="popup">
            <div class="subheader">
                <h2>Error</h2>
                <button class="x-btn" id="close-button">x</button>
            </div>
            <div class="form-group">
                <p>${message}</p>
            </div>
        </div>
        `
        this.closeButton = this.p.querySelector('#close-button');
        this.closeButton.addEventListener('click', () => this.hide());
    }

    show(message) {
        this.initializePopup(message);
        this.p.classList.add('show');
    }

    hide() {
        this.p.classList.remove('show');
    }
}
