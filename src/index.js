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


document.addEventListener('DOMContentLoaded', () => new TodoView());


class TodoView {
    constructor() {
        this.projOl = document.getElementById('project-list');
        this.todoOl = document.getElementById('todo-list');
        this.selectedProjHeader = document.getElementById('selected-project-title');

        const popUpDiv = document.getElementById('backdrop');
        const newProjectBtn = document.getElementById('new-project-btn');
        const newTodoBtn = document.getElementById('new-todo-btn');

        this.todo = new TodoManager();

        // Debug
        this.todo.addTodo(new Todo('Do thing', 'Description 2133333333333333333333333333333333333333333333333333333333333931823813', new Date(Date.now())), 'Default');
        this.todo.addTodo(new Todo('Do another thing', '', new Date(Date.now()), 3), 'Default');
        this.todo.addTodo(new Todo('Do another thing', '', new Date(Date.now())), 'Default');
        this.todo.addTodo(new Todo('Do another thing', '', new Date(Date.now()), 300), 'Default');

        this.todo.addProject('Test');
        this.todo.addProject('Test2');
        this.todo.addProject('Cool project');
        //

        this.populateProjects();
        this.selectProject(this.todo.listProjects()[0]);

        this.editTodoPopup = new editTodoPopup(popUpDiv);
        this.confirmPopup = new confirmPopup(popUpDiv);
        this.errorPopup = new errorPopup(popUpDiv);

        this.newProjectPopup = new newProjectPopup(popUpDiv);
        newProjectBtn.addEventListener('click', () => this.newProjectPopup.show((title) => this.createProject(title)));

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

    selectProject(title) {
        if (this.selectedLi) {
            this.selectedLi.classList.remove('selected');
        }
        const li = this.projOl.querySelector(`[data-name="${title}"]`)
        li.classList.add('selected');
        this.selectedLi = li;

        this.selectedProject = title;
        this.selectedProjHeader.textContent = title;
        this.#populateProjectTodos(title);
    }

    createProject(title) {
        if (!title) {
            this.errorPopup.show('Invalid new project title');
            return;
        }
        try {
            this.todo.addProject(title);
            this.populateProjects();
            this.selectProject(this.selectedProject);
        }
        catch (error) {
            this.errorPopup.show(error.message);
        }
    }

    deleteProject(title) {
        const projects = this.todo.listProjects();
        if (projects.length < 2) {
            this.errorPopup.show('There has to be at least one project');
            return;
        }
        this.confirmPopup.show(`Remove project ${title}?`,
            () => {
                this.todo.removeProject(title);
                const li = this.projOl.querySelector(`[data-name="${title}"]`);
                this.projOl.removeChild(li);

                if (this.selectedProject === title) {
                    projects.splice(projects.indexOf(title), 1);
                    this.selectProject(projects.pop());
                }
            }
        );
    }

    #populateProjectTodos(title) {
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
        let prevPriority = null;
        for (const todo of this.todo.listProjectTodos(title)) {
            if (todo.priority != prevPriority) {
                const priorityLi = document.createElement('li');
                priorityLi.textContent = `Priority: ${todo.priority}`;
                priorityLi.classList.add('list-subheader');
                prevPriority = todo.priority;
                this.todoOl.appendChild(priorityLi);
            }
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
        const todo = data.todo;
        const newProject = data.project;
        if (newProject !== todo.project) {
            this.todo.changeTodoProject(todo.id, todo.project, newProject);
        }

        delete data.todo;
        delete data.project;
        for (const key of Object.keys(data)) {
            todo[key] = data[key];
        }
        this.#populateProjectTodos(this.selectedProject);
    }

    #createTodo(data) {
        const todo = new Todo(data.title, data.description, data.dueDate, data.priority, data.notes);
        this.todo.addTodo(todo, data.project);
        this.#populateProjectTodos(this.selectedProject);
    }

    #deleteTodo(id, project) {
        this.todo.removeTodo(id, project);
        this.#populateProjectTodos(this.selectedProject);
    }
}
