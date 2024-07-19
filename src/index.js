import 'modern-normalize'
import './style.css'
import { format } from 'date-fns';

import { Todo, TodoManager } from './todo.js'
import { editTodoPopup, newTodoPopup } from './popUpsTodo.js'
import { newProjectPopup, confirmPopup, errorPopup } from './popUpsOther.js';

import deleteIcon from './img/delete.svg';
import incompleteIcon from './img/incomplete.svg';
import completeIcon from './img/complete.svg';
import calendarIcon from './img/calendar.svg'


document.addEventListener('DOMContentLoaded', () => new TodoView(
    document.getElementById('project-list'),
    document.getElementById('todo-list'),
    document.getElementById('backdrop'),
    document.getElementById('new-project-btn'),
    document.getElementById('new-todo-btn'),
));


class TodoView {
    constructor(projOl, todoOl, popUpDiv, newProjectBtn, newTodoBtn) {
        this.projOl = projOl;
        this.todoOl = todoOl;
        this.todo = new TodoManager();
        // Debug
        this.todo.addTodo(new Todo('Do thing', 'Description 2133333333333333333333333333333333333333333333333333333333333931823813', new Date(Date.now())), 'Default');
        this.todo.addTodo(new Todo('Do another thing', '', new Date(Date.now())), 'Default');
        //

        this.populateProjects();
        this.selectProject(this.todo.listProjects()[0]);

        this.editTodoPopup = new editTodoPopup(popUpDiv);
        this.confirmPopup = new confirmPopup(popUpDiv);
        this.errorPopup = new errorPopup(popUpDiv);

        this.newProjectPopup = new newProjectPopup(popUpDiv);
        newProjectBtn.addEventListener('click', () => this.newProjectPopup.show((title) => this.#createNewProject(title)));

        this.newTodoPopup = new newTodoPopup(popUpDiv);
        newTodoBtn.addEventListener('click', () => this.newTodoPopup.show(this.todo.listProjects(), this.selectedProject, (data) => this.#createTodo(data)));
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
            this.errorPopup.show('There has to be at least one project');
            return;
        }
        this.confirmPopup.show(`Remove project ${projectName}?`,
            () => {
                this.todo.removeProject(projectName);
                const li = this.projOl.querySelector(`[data-name="${projectName}"]`);
                this.projOl.removeChild(li);

                if (this.selectedProject === projectName) {
                    projects.splice(projects.indexOf(projectName), 1);
                    this.selectProject(projects.pop());
                }
            }
        );
    }

    #populateProjectTodos(projectName) {
        const currentYear = new Date().getFullYear();

        const constructEntry = (todo) => {
            const container = document.createElement('div');
            container.innerHTML = `
            <div class="todo-entry${todo.complete ? ' complete' : ''}">
                <button class="complete-button">
                    <img class="complete-icon" src=${todo.complete ? completeIcon : incompleteIcon}>
                </button>
                <button class="todo-button">
                    <p class="todo-title">${todo.title}</p>
                </button>
            </div>
            <p class="todo-description">${todo.description}</p>
            <div class="todo-info">
                <div class="due-info">
                    <img class="calendar-icon" src=${calendarIcon}>
                    <p class="todo-due-date">${format(todo.dueDate, todo.dueDate.getFullYear() === currentYear ? 'MMMM do' : 'MMMM do, yyyy')}</p>
                </div>
                <p class="todo-project">${todo.project}</p>
            </div>
            `;

            container.querySelector('.complete-button').addEventListener('click', () => {
                todo.complete = !todo.complete;
                this.#populateProjectTodos(todo.project);
            });

            container.querySelector('.todo-button').addEventListener('click', () => {
                this.#openTodoDetails(todo.id, todo.project);
            });

            container.classList.add('todo-container');
            return container;
        };

        this.todoOl.innerHTML = '';
        for (const todo of this.todo.listProjectTodos(projectName)) {
            const li = document.createElement('li');
            li.appendChild(constructEntry(todo));
            this.todoOl.appendChild(li);
        }
    }

    #openTodoDetails(id, project) {
        const todo = this.todo.getTodo(id, project);
        this.editTodoPopup.show(todo, this.todo.listProjects(), (data) => this.#todoDataUpdated(data), () => this.#deleteTodo(id, project));
    }

    #todoDataUpdated(data) {
        if (!this.#validateTodoData(data)) return;
        // Todo: Add changing project of todo
        const todo = data.todo;
        delete data.todo;
        for (const key of Object.keys(data)) {
            todo[key] = data[key];
        }
        this.selectProject(todo.project);
    }

    #createNewProject(title) {
        if (!title) {
            this.errorPopup.show('Invalid new project title');
            return;
        }
        try {
            this.todo.addProject(title);
            this.populateProjects();
        }
        catch (error) {
            this.errorPopup.show(error.message);
        }
    }

    #createTodo(data) {
        if (!this.#validateTodoData(data)) return;
        const todo = new Todo(data.title, data.description, data.dueDate, data.priority, data.notes);
        this.todo.addTodo(todo, this.selectedProject);
        this.#populateProjectTodos(this.selectedProject);
    }

    #deleteTodo(id, project) {
        this.todo.removeTodo(id, project);
        this.#populateProjectTodos(this.selectedProject);
    }

    #validateTodoData(data) {
        if (!data.title) {
            this.errorPopup.show('Invalid title');
            return false;
        }
        if (!(data.dueDate instanceof Date)) {
            this.errorPopup.show('Invalid date');
            return false;
        }
        data.priority = data.priority || 1;
        return true;
    }
}
