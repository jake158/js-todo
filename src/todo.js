

export class Todo {
    #title;
    #description;
    #dueDate;
    #priority;
    #notes;
    #complete;

    constructor(title, description = '', dueDate, priority = 1, notes = '') {
        if (!(dueDate instanceof Date)) { throw new Error(`dueDate ${dueDate} is not an instance of Date`); }
        if (isNaN(priority)) { throw new Error(`Priority ${priority} is not a valid number`); }
        this.#title = title;
        this.#description = description;
        this.#dueDate = dueDate;
        this.#priority = priority;
        this.#notes = notes;
        this.#complete = false;
    }

    get title() {
        return this.#title;
    }

    set title(title) {
        this.#title = title;
    }

    get description() {
        return this.#description;
    }

    set description(newDescription) {
        this.#description = newDescription;
    }

    get dueDate() {
        return this.#dueDate;
    }

    set dueDate(dueDate) {
        if (!(dueDate instanceof Date)) { throw new Error(`dueDate ${dueDate} must be an instance of Date`); }
        this.#dueDate = dueDate;
    }

    get priority() {
        return this.#priority;
    }

    set priority(newPriority) {
        if (isNaN(newPriority)) { throw new Error(`Priority ${newPriority} is not a valid number`); }
        this.#priority = newPriority;
    }

    get notes() {
        return this.#notes;
    }

    set notes(notes) {
        this.#notes = notes;
    }

    get complete() {
        return this.#complete;
    }

    makeComplete() {
        this.#complete = true;
    }

    makeIncomplete() {
        this.#complete = false;
    }
}


export class TodoManager {
    constructor() {
        this.projects = {};
        this.projects["Default"] = [];
    }

    addProject(project) {
        if (this.projects[project]) { throw new Error(`Project ${project} already exists`); }
        this.projects[project] = [];
    }

    removeProject(project) {
        if (this.projects[project] === undefined) { throw new Error(`Project ${project} does not exist`); }
        delete this.projects[project];
    }

    listProjects() {
        return Object.keys(this.projects);
    }


    addTodo(todo, project = "Default") {
        if (!(todo instanceof Todo)) { throw new Error('Given todo is not an instance of Todo'); }
        if (this.projects[project] === undefined) { throw new Error(`Project ${project} not found`); }
        const projectLen = this.projects[project].length;

        todo.id = projectLen !== 0 ? this.projects[project][projectLen - 1].id + 1 : 0;
        this.projects[project].push(todo);
        return todo.id;
    }

    removeTodo(id, project) {
        const index = this.projects[project].findIndex(e => e.id === id);
        if (index !== -1) {
            this.projects[project].splice(index, 1)
        }
        else {
            throw new Error(`Todo with id ${id} not found in project ${project}`);
        }
    }

    getTodo(id, project) {
        const index = this.projects[project].findIndex(e => e.id === id);
        if (index !== -1) {
            return this.projects[project][index];
        }
        else {
            return null;
        }
    }

    listProjectTodos(project = "Default") {
        if (this.projects[project] === undefined) { throw new Error(`Project ${project} does not exist`) }
        return this.projects[project].sort(
            (a, b) => {
                return a.priority <= b.priority ? -1 : 1;
            }
        );
    }

    listTodosBefore(date) {
        if (!date instanceof Date) { throw new Error('Invalid date'); }
        const todos = [];
        for (const project of Object.keys(this.projects)) {
            todos = [...todos, ...this.projects[project].filter(e => e.dueDate < date)]
        }
        return todos.length === 0 ? null : todos;
    }
}
