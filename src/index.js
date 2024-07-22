import 'modern-normalize'
import './style.css'
import { addDays, subDays, startOfDay, format } from 'date-fns';

import { Todo, TodoManager } from './todo.js'
import { editTodoPopup, newTodoPopup } from './popUpsTodo.js'
import { newProjectPopup, confirmPopup, errorPopup } from './popUpsOther.js';

import todayIcon from './img/calendar-blank.svg';
import weekIcon from './img/calendar-blank-multiple.svg';
import doneIcon from './img/trash-can.svg';
import projectIcon from './img/project.svg';
import projectDeleteIcon from './img/delete.svg';

import incompleteIcon from './img/incomplete.svg';
import completeIcon from './img/complete.svg';
import calendarIcon from './img/calendar.svg'


document.addEventListener('DOMContentLoaded', () => new TodoView());


class TodoView {
    constructor() {
        this.catgOl = document.getElementById('category-list');
        this.projOl = document.getElementById('project-list');
        this.todoOl = document.getElementById('todo-list');
        this.selectedHeader = document.getElementById('selected-title');

        const popUpDiv = document.getElementById('backdrop');
        const newProjectBtn = document.getElementById('new-project-btn');
        const newTodoBtn = document.getElementById('new-todo-btn');

        this.todo = new TodoManager();

        // Showcase
        this.todo.addTodo(new Todo('Pay Taxes', '', subDays(new Date(), 365), 2), 'Default');
        this.todo.addTodo(new Todo('Renew Driver\'s License', '', subDays(new Date(), 21), 2), 'Default');
        this.todo.addTodo(new Todo('Book Flight Tickets', 'Oh god', new Date()), 'Default');

        this.todo.addProject('Coding');

        this.todo.addTodo(new Todo('Finish The Odin Project - JavaScript', '', addDays(new Date(), 7), 1), 'Coding');
        this.todo.addTodo(new Todo('Finish The Odin Project', '', addDays(new Date(), 90), 1), 'Coding');
        this.todo.addTodo(new Todo('Learn C#', '', addDays(new Date(), 180), 2), 'Coding');
        this.todo.addTodo(new Todo('Get a job', '', addDays(new Date(), 240), 2), 'Coding');
        //

        this.populateCategories();
        this.populateProjects();
        this.selectCategory('Today');

        this.editTodoPopup = new editTodoPopup(popUpDiv);
        this.confirmPopup = new confirmPopup(popUpDiv);
        this.errorPopup = new errorPopup(popUpDiv);

        this.newProjectPopup = new newProjectPopup(popUpDiv);
        newProjectBtn.addEventListener('click', () => this.newProjectPopup.show((title) => this.createProject(title)));

        this.newTodoPopup = new newTodoPopup(popUpDiv);
        newTodoBtn.addEventListener('click', () => this.newTodoPopup.show(this.todo.listProjects(), this.selectedProject, (data) => this.#createTodo(data)));
    }

    #constructEntry(todo, currentDate, renderOverdue = true, renderProject = true) {
        const renderYear = todo.dueDate.getFullYear() !== currentDate.getFullYear();
        const overdue = startOfDay(currentDate) > startOfDay(todo.dueDate);

        const getDueString = (dueDate) => {
            const date = format(dueDate, renderYear ? 'MMMM do, yyyy' : 'MMMM do');
            return date + (overdue && renderOverdue ? ' - Overdue' : '');
        }

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
                    <p class="todo-due-date${overdue && renderOverdue ? ' overdue' : ''}">${getDueString(todo.dueDate)}</p>
                </div>
                <p class="todo-project">${renderProject ? todo.project : ''}</p>
            </div>
            `;

        container.querySelector('.complete-button').addEventListener('click', () => {
            todo.complete = !todo.complete;
            this.refreshTodos();
        });

        container.querySelector('.todo-button').addEventListener('click', () => {
            this.#openTodoDetails(todo.id, todo.project);
        });

        container.classList.add('todo-container');
        return container;
    };

    populateCategories() {
        this.catgOl.innerHTML = `
            <li class="sidebar-item" data-name="Today">
                <button class="select-button" data-target="Today">
                    <img class="icon" src="${todayIcon}" />
                    <p>Today</p>
                </button>
            </li>
            <li class="sidebar-item" data-name="Week">
                <button class="select-button" data-target="Week">
                    <img class="icon" src="${weekIcon}" />
                    <p>Week</p>
                </button>
            </li>
            <li class="sidebar-item" data-name="Done">
                <button class="select-button" data-target="Done">
                    <img class="icon" src="${doneIcon}" />
                    <p>Done</p>
                </button>
            </li>
        `;

        this.catgOl.querySelectorAll('.select-button').forEach(button => {
            button.addEventListener('click', () => this.selectCategory(button.dataset.target));
        });
    }

    selectCategory(title) {
        if (this.selectedLi) {
            this.selectedLi.classList.remove('selected');
        }
        const li = this.catgOl.querySelector(`[data-name="${title}"]`)
        li.classList.add('selected');
        this.selectedLi = li;

        this.selectedProject = null;
        this.selectedCategory = title;
        this.selectedHeader.textContent = title;

        this.#populateCategory(title);
    }

    #populateCategory(title) {
        switch (title) {
            case 'Today':
                const tomorrow = addDays(new Date(), 1);
                this.#populateTodos(this.todo.listTodosBefore(tomorrow).filter(todo => !todo.complete));
                break;
            case 'Week':
                const nextWeek = addDays(new Date(), 7);
                this.#populateTodos(this.todo.listTodosBefore(nextWeek).filter(todo => !todo.complete));
                break;
            case 'Done':
                this.#populateTodos(this.todo.listAllTodos().filter(todo => todo.complete), false, false);
                break;
        }
    }

    populateProjects() {
        this.projOl.innerHTML = '';
        for (const title of this.todo.listProjects()) {
            this.projOl.innerHTML += `
            <li class="sidebar-item" data-name="${title}">
                <button class="select-button" data-target="${title}">
                    <img class="icon" src="${projectIcon}" />
                    <p>${title}</p>
                </button>
                <button class="delete-button">
                    <img class="icon delete-icon" src="${projectDeleteIcon}" />
                </button>
            </li>
        `;
        }

        this.projOl.querySelectorAll('.select-button').forEach(button => {
            button.addEventListener('click', () => this.selectProject(button.dataset.target));
        });

        this.projOl.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', () => this.deleteProject(button.closest('li').dataset.name));
        });
    }

    selectProject(title) {
        if (this.selectedLi) {
            this.selectedLi.classList.remove('selected');
        }
        const li = this.projOl.querySelector(`[data-name="${title}"]`)
        li.classList.add('selected');
        this.selectedLi = li;

        this.selectedCategory = null;
        this.selectedProject = title;
        this.selectedHeader.textContent = title;

        this.#populateProject(title);
    }

    #populateProject(title) {
        this.#populateTodos(this.todo.listProjectTodos(title).filter(todo => !todo.complete), true, true, false);
    }

    refreshTodos() {
        if (this.selectedProject) {
            this.#populateProject(this.selectedProject);
        }
        else if (this.selectedCategory) {
            this.#populateCategory(this.selectedCategory);
        }
    }

    createProject(title) {
        if (!title) {
            this.errorPopup.show('Invalid new project title');
            return;
        }
        try {
            this.todo.addProject(title);
            this.populateProjects();
            if (this.selectedProject) {
                this.selectProject(this.selectedProject);
            }
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

    #populateTodos(todoArray, renderPriority = true, renderOverdue = true, renderProject = true) {
        const constructPriorityLi = (priority) => {
            const li = document.createElement('li');
            li.textContent = `Priority: ${priority}`;
            li.classList.add('list-subheader');
            return li;
        }

        const currentDate = new Date();
        let prevPriority = null;
        this.todoOl.innerHTML = '';

        for (const todo of todoArray) {
            if (renderPriority && (todo.priority != prevPriority)) {
                prevPriority = todo.priority;
                this.todoOl.appendChild(constructPriorityLi(todo.priority));
            }
            const li = document.createElement('li');
            li.appendChild(this.#constructEntry(todo, currentDate, renderOverdue, renderProject));
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
        this.refreshTodos();
    }

    #createTodo(data) {
        const todo = new Todo(data.title, data.description, data.dueDate, data.priority, data.notes);
        this.todo.addTodo(todo, data.project);
        this.refreshTodos();
    }

    #deleteTodo(id, project) {
        this.todo.removeTodo(id, project);
        this.refreshTodos();
    }
}
