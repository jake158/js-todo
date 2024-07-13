import 'modern-normalize'
import './style.css'
import { Todo, TodoManager } from './todo.js'
import { format, parse } from "date-fns";


document.addEventListener('DOMContentLoaded', () => new TodoView(
    document.getElementById('project-list'),
    document.getElementById('todo-list'),
    document.getElementById('edit-todo-popup')
));


class TodoView {
    constructor(projOl, todoOl, popUpDiv) {
        this.projOl = projOl;
        this.todoOl = todoOl;
        this.todo = new TodoManager();
        this.popUp = new todoPopUp(popUpDiv, (data) => this.todoDataUpdated(data));

        // Debug
        this.todo.addTodo(new Todo('Do thing', '', new Date(Date.now())), 'Default');
        this.todo.addTodo(new Todo('Do another thing', '', new Date(Date.now())), 'Default');

        this.todo.addProject('Project 2');
        this.todo.addTodo(new Todo('Project 2 todo, priority 100', '', new Date(Date.now()), 100), 'Project 2');
        this.todo.addTodo(new Todo('Project 2 todo, priority 1', '', new Date(Date.now())), 'Project 2');

        this.todo.addProject('Test');
        //

        const defaultProject = this.todo.listProjects()[0];
        this.populateProjects();
        this.populateProjectTodos(defaultProject);
        this.makeSelected(this.projOl.children[0]);
    }

    populateProjects() {
        for (const projName of this.todo.listProjects()) {
            const li = document.createElement('li');
            const button = document.createElement('button');

            button.textContent = projName;
            button.addEventListener('click', (e) => {
                this.populateProjectTodos(e.target.textContent);
                this.makeSelected(li);
            });

            li.appendChild(button);
            this.projOl.appendChild(li);
        }
    }

    populateProjectTodos(project) {
        this.todoOl.innerHTML = '';
        for (const todo of this.todo.listProjectTodos(project)) {
            const li = document.createElement('li');
            const button = document.createElement('button');

            button.textContent = todo.title;
            button.addEventListener('click', () => this.openTodoDetails(todo.id, project));

            li.appendChild(button);
            this.todoOl.appendChild(li);
        }
    }

    makeSelected(li) {
        if (this.selectedProject) {
            this.selectedProject.classList.remove('selected');
        }
        li.classList.add('selected');
        this.selectedProject = li;
    }

    openTodoDetails(id, project) {
        const todo = this.todo.getTodo(id, project);
        this.popUp.show(todo);
    }

    todoDataUpdated(data) {
        const todo = data.todo;
        delete data.todo;
        for (const key of Object.keys(data)) {
            todo[key] = data[key];
        }
        this.populateProjectTodos(todo.project);
    }
}


class todoPopUp {
    constructor(parent, callback) {
        this.p = parent;
        this.p.innerHTML = this.#initializePopup();

        this.title = this.p.querySelector('#title');
        this.description = this.p.querySelector('#description');
        this.dueDate = this.p.querySelector('#due-date');
        this.priority = this.p.querySelector('#priority');
        this.notes = this.p.querySelector('#notes');

        this.saveButton = this.p.querySelector('#save-button');
        this.saveButton.addEventListener('click', () => this.popUpClosed(callback));
    }

    #initializePopup() {
        return `
        <h2>Edit Todo</h2>
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
    }

    show(todo) {
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
        this.dueDate.value = format(todo['dueDate'], 'yyyy-MM-dd');
        this.todo = todo;
        this.p.classList.add('show');
    }

    hide() {
        this.p.classList.remove('show');
    }

    popUpClosed(callback) {
        this.hide();
        callback({
            title: this.title.value,
            description: this.description.value,
            dueDate: parse(this.dueDate.value, 'yyyy-MM-dd', new Date()),
            priority: this.priority.value || 1,
            notes: this.notes.value,
            todo: this.todo,
        });
    }
}
