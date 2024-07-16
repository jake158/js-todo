import 'modern-normalize'
import './style.css'
import { Todo, TodoManager } from './todo.js'
import { editTodoPopup, newTodoPopup, newProjectPopup } from './popUps.js';
import deleteIcon from './img/delete.svg';


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

        this.editTodoPopup = new editTodoPopup(popUpDiv);
        this.newTodoPopup = new newTodoPopup(popUpDiv);
        this.newProjectPopup = new newProjectPopup(popUpDiv);

        newProjectBtn.addEventListener('click', () => this.newProjectPopup.show((title) => this.#createNewProject(title)));
        newTodoBtn.addEventListener('click', () => this.newTodoPopup.show((data) => this.#createNewTodo(data)));
    }

    populateProjects() {
        this.projOl.innerHTML = '';
        for (const projName of this.todo.listProjects()) {
            const li = document.createElement('li');
            li.dataset.name = projName;

            const selectBtn = document.createElement('button');
            selectBtn.classList.add('project-select-button');
            selectBtn.textContent = projName;
            selectBtn.addEventListener('click', () => this.selectProject(projName));

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('project-delete-button');
            deleteBtn.addEventListener('click', () => this.deleteProject(projName));

            const deleteSymbol = document.createElement('img');
            deleteSymbol.classList.add('delete-icon');
            deleteSymbol.src = deleteIcon;
            deleteBtn.appendChild(deleteSymbol);

            li.appendChild(selectBtn);
            li.appendChild(deleteBtn);
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

    deleteProject(projectName) {
        const projects = this.todo.listProjects();
        if (projects.length < 2) {
            alert('There has to be at least one project');
            return;
        }
        this.todo.removeProject(projectName);
        const li = this.projOl.querySelector(`[data-name="${projectName}"]`);
        this.projOl.removeChild(li);

        if (this.selectedProject === projectName) {
            projects.splice(projects.indexOf(projectName), 1);
            this.selectProject(projects.pop());
        }
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
        this.editTodoPopup.show(todo, (data) => this.#todoDataUpdated(data));
    }

    #todoDataUpdated(data) {
        if (!this.#validateTodoData(data)) return;
        const todo = data.todo;
        delete data.todo;
        for (const key of Object.keys(data)) {
            todo[key] = data[key];
        }
        this.selectProject(todo.project);
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
        if (!(data.dueDate instanceof Date)) {
            alert('Invalid date');
            return false;
        }
        data.priority = data.priority || 1;
        return true;
    }
}
