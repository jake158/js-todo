import { format, parse } from 'date-fns';
import deleteIcon from './img/delete.svg';


export class editTodoPopup {
    constructor(parent) {
        this.p = parent;
    }

    initializePopup(title, projects, selectedProject, updateCallback, deleteCallback) {
        const projectOptions = projects.map(project =>
            `<option value="${project}" ${project === selectedProject ? 'selected' : ''}>${project}</option>`
        ).join('');

        this.p.innerHTML = `
        <div class="popup edit-todo">
            <div class="subheader">
                <h2>${title}</h2>
                <button class="x-btn" id="close-button">x</button>
            </div>
            <div class="form-group horizontal">
                <div class="form-group edit-todo-main pad">
                    <div class="form-group">
                        <input type="text" id="title" name="title" placeholder="Title" autocomplete="off" required>
                        <textarea id="description" name="description" placeholder="Description" autocomplete="off"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="notes">Notes</label>
                        <textarea id="notes" name="notes" placeholder="Note" autocomplete="off"></textarea>
                    </div>
                </div>
                <div class="form-group edit-todo-sidebar pad">
                    <div class="form-group">
                        <label for="project">Project</label>
                        <select name="project" id="project">
                            ${projectOptions}
                        </select>
                        <label for="due-date">Due Date</label>
                        <input type="date" id="due-date" name="dueDate">
                        <label for="priority">Priority</label>
                        <input type="number" id="priority" name="priority" value="1">
                    </div>
                    <div class="form-group todo-button-area">
                        <button id="delete-button"><img src=${deleteIcon}></button>
                    </div>
                </div>
            </div>
        </div>
        `
        this.title = this.p.querySelector('#title');
        this.description = this.p.querySelector('#description');
        this.dueDate = this.p.querySelector('#due-date');
        this.priority = this.p.querySelector('#priority');
        this.notes = this.p.querySelector('#notes');
        this.project = this.p.querySelector('#project');

        this.closeButton = this.p.querySelector('#close-button');
        this.closeButton.addEventListener('click', () => this.popupClosed(updateCallback));

        this.closeButton = this.p.querySelector('#delete-button');
        this.closeButton.addEventListener('click', () => this.popupClosed(deleteCallback));
    }

    show(todo, projects, updateCallback, deleteCallback) {
        this.initializePopup('Edit Todo', projects, todo.project, updateCallback, deleteCallback);
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

    popupClosed(callback) {
        this.hide();
        callback({
            title: this.title.value,
            description: this.description.value,
            dueDate: parse(this.dueDate.value, 'yyyy-MM-dd', new Date()),
            priority: this.priority.value,
            notes: this.notes.value,
            project: this.project.value,
            todo: this.todo,
        });
    }
}


export class newTodoPopup extends editTodoPopup {
    constructor(parent) {
        super(parent);
    }

    show(projects, currentProject, callback) {
        this.initializePopup("Add Todo", projects, currentProject, callback);
        this.dueDate.value = format(new Date(Date.now()), 'yyyy-MM-dd');

        const buttonArea = this.p.querySelector('.todo-button-area');
        buttonArea.innerHTML = `
        <button id="add-button">Add</button>
        `
        this.addButton = buttonArea.querySelector('button');
        this.addButton.addEventListener('click', () => this.popupClosed(callback));

        this.closeButton = this.p.querySelector('#close-button');
        this.closeButton.addEventListener('click', () => this.hide());

        this.p.classList.add('show');
    }
}
