import { format, parse } from "date-fns";


export class editTodoPopup {
    constructor(parent) {
        this.p = parent;
    }

    initializePopup(title, callback) {
        this.callback = callback;
        this.p.innerHTML = `
        <div class="subheader">
            <h2>${title}</h2>
            <button class="x-btn" id="close-button">x</button>
        </div>
        <div class="form-group">
            <label for="title">Title</label>
            <input type="text" id="title" name="title">
        </div>
        <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" name="description"></textarea>
        </div>
        <div class="form-group">
            <label for="due-date">Due Date</label>
            <input type="date" id="due-date" name="dueDate">
        </div>
        <div class="form-group">
            <label for="priority">Priority</label>
            <input type="number" id="priority" name="priority" min="1" required>
        </div>
        <div class="form-group">
            <label for="notes">Notes</label>
            <textarea id="notes" name="notes"></textarea>
        </div>
        <div class="form-group">
            <button id="save-button">Save</button>
        </div>
        `
        this.title = this.p.querySelector('#title');
        this.description = this.p.querySelector('#description');
        this.dueDate = this.p.querySelector('#due-date');
        this.priority = this.p.querySelector('#priority');
        this.notes = this.p.querySelector('#notes');

        this.saveButton = this.p.querySelector('#save-button');
        this.saveButton.addEventListener('click', () => this.popupClosed());

        this.closeButton = this.p.querySelector('#close-button');
        this.closeButton.addEventListener('click', () => this.hide());
    }

    show(todo, callback) {
        this.initializePopup("Edit Todo", callback);
        const info = {
            title: todo.title,
            description: todo.description,
            dueDate: todo.dueDate,
            priority: todo.priority,
            notes: todo.notes,
        }
        for (const key of Object.keys(info)) {
            this[key].value = info[key];
        }
        this.dueDate.value = format(info['dueDate'], 'yyyy-MM-dd');
        this.todo = todo;
        this.p.classList.add('show');
    }

    hide() {
        this.p.classList.remove('show');
    }

    popupClosed() {
        this.hide();
        this.callback({
            title: this.title.value,
            description: this.description.value,
            dueDate: parse(this.dueDate.value, 'yyyy-MM-dd', new Date()),
            priority: this.priority.value,
            notes: this.notes.value,
            todo: this.todo,
        });
    }
}


export class newTodoPopup extends editTodoPopup {
    constructor(parent) {
        super(parent);
    }

    show(callback) {
        this.initializePopup("Add Todo", callback);
        this.dueDate.value = format(new Date(Date.now()), 'yyyy-MM-dd');
        this.p.classList.add('show');
    }
}
