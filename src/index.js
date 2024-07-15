import 'modern-normalize'
import './style.css'
import { Todo, TodoManager } from './todo.js'
import { todoPopup, projectPopup } from './popUps.js';


document.addEventListener('DOMContentLoaded', () => new TodoView(
    document.getElementById('project-list'),
    document.getElementById('todo-list'),
    document.getElementById('edit-todo-popup'),
    document.getElementById('new-project-btn'),
    document.getElementById('new-todo-btn'),
));


class TodoView {
    constructor(projOl, todoOl, popUpDiv, newProjectBtn, newTodoBtn) {
        this.projOl = projOl;
        this.todoOl = todoOl;
        this.todo = new TodoManager();

        // Debug
        this.todo.addTodo(new Todo('Do thing', '', new Date(Date.now())), 'Default');
        this.todo.addTodo(new Todo('Do another thing', '', new Date(Date.now())), 'Default');

        this.todo.addProject('Project 2');
        this.todo.addTodo(new Todo('Project 2 todo, priority 100', '', new Date(Date.now()), 100), 'Project 2');
        this.todo.addTodo(new Todo('Project 2 todo, priority 1', '', new Date(Date.now())), 'Project 2');

        this.todo.addProject('Test');
        //

        this.populateProjects();
        this.selectProject(this.todo.listProjects()[0]);

        this.todoPopup = new todoPopup(popUpDiv);
        this.projectPopup = new projectPopup(popUpDiv);

        newProjectBtn.addEventListener('click', () => this.projectPopup.show((title) => this.#createNewProject(title)));
        newTodoBtn.addEventListener('click', () => this.todoPopup.show({}, (data) => this.#createNewTodo(data)));
    }

    populateProjects() {
        this.projOl.innerHTML = '';
        for (const projName of this.todo.listProjects()) {
            const li = document.createElement('li');
            const button = document.createElement('button');

            li.dataset.name = projName;
            button.textContent = projName;
            button.addEventListener('click', () => this.selectProject(projName));

            li.appendChild(button);
            this.projOl.appendChild(li);
        }
    }

    selectProject(projectName) {
        if (this.selectedLi) {
            this.selectedLi.classList.remove('selected');
        }
        const li = this.projOl.querySelector(`[data-name="${projectName}"]`)
        li.classList.add('selected');
        this.selectedLi = li;

        this.selectedProject = projectName;
        this.#populateProjectTodos(projectName);
    }

    #populateProjectTodos(projectName) {
        this.todoOl.innerHTML = '';
        for (const todo of this.todo.listProjectTodos(projectName)) {
            const li = document.createElement('li');
            const button = document.createElement('button');

            button.textContent = todo.title;
            button.addEventListener('click', () => this.#openTodoDetails(todo.id, projectName));

            li.appendChild(button);
            this.todoOl.appendChild(li);
        }
    }

    #openTodoDetails(id, project) {
        const todo = this.todo.getTodo(id, project);
        this.todoPopup.show(todo, (data) => this.#todoDataUpdated(data));
    }

    #todoDataUpdated(data) {
        if (!this.#validateTodoData(data)) return;
        const todo = data.todo;
        delete data.todo;
        for (const key of Object.keys(data)) {
            todo[key] = data[key];
        }
        this.#populateProjectTodos(todo.project);
    }

    #createNewProject(title) {
        if (!title) {
            alert(`Invalid new project title`);
            return;
        }
        try {
            this.todo.addProject(title);
            this.populateProjects();
        }
        catch (error) {
            alert(error.message);
        }
    }

    #createNewTodo(data) {
        if (!this.#validateTodoData(data)) return;
        const todo = new Todo(data.title, data.description, data.dueDate, data.priority, data.notes);
        this.todo.addTodo(todo, this.selectedProject);
        this.#populateProjectTodos(this.selectedProject);
    }

    #validateTodoData(data) {
        if (!data.title) {
            alert('Invalid title');
            return false;
        }
        data.priority = data.priority || 1;
        return true;
    }
}
