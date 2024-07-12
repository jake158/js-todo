

export class Todo {
    constructor(title, description = '', dueDate, priority = 1, notes = '') {
        if (!(dueDate instanceof Date)) { throw new Error(`dueDate ${dueDate} is not an instance of Date`); }
        if (isNaN(priority)) { throw new Error(`Priority ${priority} is not a valid number`); }
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.notes = notes;
    }

    change(attribute, newValue) {
        if (this[attribute] === undefined) { throw new Error(`Attribute ${attribute} does not exist in object Todo`); }
        if (attribute === 'dueDate' && !(newValue instanceof Date)) { throw new Error(`dueDate ${newValue} must be an instance of Date`); }
        if (attribute === 'priority' && isNaN(newValue)) { throw new Error(`Priority ${newValue} is not a valid number`); }
        this[attribute] = newValue;
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
        return [...this.projects[project]];
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
