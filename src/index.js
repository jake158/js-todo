import { Todo, TodoManager } from './todo.js'

document.addEventListener('DOMContentLoaded', () => new TodoView());


class TodoView {
    constructor() {
        this.todo = new TodoManager();
        console.log(this.todo.listProjects());
        console.log(this.todo.addTodo(new Todo('Priority 2', 'desc', new Date(Date.now()), 2)));
        console.log(this.todo.addTodo(new Todo('Priority 300', 'desc', new Date(Date.now()), 300)));
        console.log(this.todo.addTodo(new Todo('Priority 1', 'desc', new Date(Date.now()))));
        console.log(this.todo.listProjectTodos());
    }
}
