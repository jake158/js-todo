import 'modern-normalize'
import './style.css'
import { addDays, format } from 'date-fns';

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
        this.catgOl = document.getElementById('category-list');
        this.projOl = document.getElementById('project-list');
        this.todoOl = document.getElementById('todo-list');
        this.selectedProjHeader = document.getElementById('selected-project-title');

        const popUpDiv = document.getElementById('backdrop');
        const newProjectBtn = document.getElementById('new-project-btn');
        const newTodoBtn = document.getElementById('new-todo-btn');

        this.todo = new TodoManager();

        // Debug
        this.todo.addTodo(new Todo('Do thing', 'Cool description', new Date()), 'Default');
        this.todo.addTodo(new Todo('Do another thing', '', new Date(), 3), 'Default');
        this.todo.addTodo(new Todo('Thing in 3 days', '', addDays(new Date(), 3)), 'Default');
        this.todo.addTodo(new Todo('Thing in 8 days', '', addDays(new Date(), 8), 300), 'Default');

        this.todo.addProject('Test');
        this.todo.addProject('Test2');
        this.todo.addProject('Cool project');
        //

        this.populateCategories();
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

    #constructEntry(todo, longDate = false) {
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
                    <p class="todo-due-date">${format(todo.dueDate, longDate ? 'MMMM do, yyyy' : 'MMMM do')}</p>
                </div>
                <p class="todo-project">${todo.project}</p>
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
                <button class="select-button">Today</button>
            </li>
            <li class="sidebar-item" data-name="Week">
                <button class="select-button">Week</button>
            </li>
            <li class="sidebar-item" data-name="Done">
                <button class="select-button">Done</button>
            </li>
        `;

        this.catgOl.querySelectorAll('.select-button').forEach(button => {
            button.addEventListener('click', (event) => this.selectCategory(event.target.textContent));
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
        this.selectedProjHeader.textContent = title;

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
                this.#populateTodos(this.todo.listAllTodos().filter(todo => todo.complete));
                break;
        }
    }

    populateProjects() {
        this.projOl.innerHTML = '';
        for (const title of this.todo.listProjects()) {
            this.projOl.innerHTML += `
            <li class="sidebar-item" data-name="${title}">
                <button class="select-button">${title}</button>
                <button class="delete-button">
                    <img class="delete-icon" src="${deleteIcon}" />
                </button>
            </li>
        `;
        }

        this.projOl.querySelectorAll('.select-button').forEach(button => {
            button.addEventListener('click', (event) => this.selectProject(event.target.textContent));
        });

        this.projOl.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', (event) => this.deleteProject(button.closest('li').dataset.name));
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
        this.selectedProjHeader.textContent = title;

        this.#populateProject(title);
    }

    #populateProject(title) {
        this.#populateTodos(this.todo.listProjectTodos(title).filter(todo => !todo.complete));
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

    #populateTodos(todoArray) {
        const constructPriorityLi = (priority) => {
            const li = document.createElement('li');
            li.textContent = `Priority: ${priority}`;
            li.classList.add('list-subheader');
            return li;
        }

        const currentYear = new Date().getFullYear();
        let prevPriority = null;
        this.todoOl.innerHTML = '';

        for (const todo of todoArray) {
            if (todo.priority != prevPriority) {
                prevPriority = todo.priority;
                this.todoOl.appendChild(constructPriorityLi(todo.priority));
            }
            const li = document.createElement('li');
            li.appendChild(this.#constructEntry(todo, todo.dueDate.getFullYear() !== currentYear));
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
