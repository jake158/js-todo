

export class Todo {
    #title;
    #description;
    #dueDate;
    #priority;
    #notes;
    #complete;

    constructor(title, description = '', dueDate, priority = 1, notes = '') {
        if (!(dueDate instanceof Date)) { throw new Error(`dueDate '${dueDate}' is not an instance of Date`); }
        if (isNaN(priority)) { throw new Error(`Priority '${priority}' is not a valid number`); }
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
        if (!(dueDate instanceof Date)) { throw new Error(`dueDate '${dueDate}' must be an instance of Date`); }
        this.#dueDate = dueDate;
    }

    get priority() {
        return this.#priority;
    }

    set priority(newPriority) {
        if (isNaN(newPriority)) { throw new Error(`Priority '${newPriority}' is not a valid number`); }
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

    set complete(bool) {
        this.#complete = !!bool;
    }

    toJSON() {
        return {
            title: this.#title,
            description: this.#description,
            dueDate: this.#dueDate.toISOString(),
            priority: this.#priority,
            notes: this.#notes,
            complete: this.#complete,
            id: this.id,
            project: this.project,
        };
    }

    static fromJSON(json) {
        const data = JSON.parse(json);
        data.dueDate = new Date(data.dueDate);
        const todo = new Todo(
            data.title,
            data.description,
            data.dueDate,
            data.priority,
            data.notes
        );
        todo.complete = data.complete;
        todo.id = data.id;
        todo.project = data.project;
        return todo;
    }
}


export class TodoManager {
    constructor(initialState = null) {
        this.projects = initialState ? this.#parseInitialState(initialState) : {};
        if (!initialState) {
            this.projects["Default"] = [];
        }
    }

    #parseInitialState(initialState) {
        const parsedState = JSON.parse(initialState);
        const projects = {};
        for (const [project, todos] of Object.entries(parsedState)) {
            projects[project] = todos.map(todoJson => Todo.fromJSON(JSON.stringify(todoJson)));
        }
        return projects;
    }

    dumpState() {
        const projects = {};
        for (const [project, todos] of Object.entries(this.projects)) {
            projects[project] = todos.map(todo => todo.toJSON());
        }
        return JSON.stringify(projects);
    }

    addProject(project) {
        if (this.projects[project]) { throw new Error(`Project '${project}' already exists`); }
        this.projects[project] = [];
    }

    removeProject(project) {
        if (this.projects[project] === undefined) { throw new Error(`Project '${project}' does not exist`); }
        delete this.projects[project];
    }


    addTodo(todo, project = "Default") {
        if (!(todo instanceof Todo)) { throw new Error('Given todo is not an instance of Todo'); }
        if (this.projects[project] === undefined) { throw new Error(`Project '${project}' does not exist`); }
        const projectLen = this.projects[project].length;

        todo.id = projectLen === 0 ? 0 : this.projects[project][projectLen - 1].id + 1;
        todo.project = project;
        this.projects[project].push(todo);
        return todo.id;
    }

    removeTodo(id, project) {
        const index = this.projects[project].findIndex(e => e.id === id);
        if (index !== -1) {
            this.projects[project].splice(index, 1)
        }
        else {
            throw new Error(`Todo with id '${id}' not found in project '${project}'`);
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

    changeTodoProject(id, oldProject, newProject) {
        const todo = this.getTodo(id, oldProject);
        if (!todo) { throw new Error(`Todo with id '${id}' not found in project '${oldProject}'`); }
        this.removeTodo(id, oldProject);
        this.addTodo(todo, newProject);
    }


    #priorityAndDateSort(a, b) {
        if (a.priority !== b.priority) {
            return a.priority - b.priority;
        } else {
            return a.dueDate - b.dueDate;
        }
    }

    listProjects() {
        return Object.keys(this.projects);
    }

    listProjectTodos(project = "Default") {
        if (this.projects[project] === undefined) { throw new Error(`Project '${project}' does not exist`) }
        return this.projects[project].sort(this.#priorityAndDateSort);
    }

    listTodosBefore(date) {
        if (!date instanceof Date) { throw new Error('Invalid date'); }
        let todos = [];
        for (const project of Object.keys(this.projects)) {
            todos = [...todos, ...this.projects[project].filter(e => e.dueDate < date)]
        }
        return todos.sort(this.#priorityAndDateSort);
    }

    listAllTodos() {
        let todos = [];
        for (const project of Object.keys(this.projects)) {
            todos = [...todos, ...this.projects[project]]
        }
        return todos.sort(this.#priorityAndDateSort);
    }
}
