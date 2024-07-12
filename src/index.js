import 'modern-normalize'
import './style.css'
import { Todo, TodoManager } from './todo.js'

document.addEventListener('DOMContentLoaded', () => new TodoView(
    document.getElementById('project-list'),
    document.getElementById('todo-list')
));


class TodoView {
    constructor(projOl, todoOl) {
        this.projOl = projOl;
        this.todoOl = todoOl;
        this.todo = new TodoManager();

        // Debug
        this.todo.addTodo(new Todo('Do thing', '', new Date(Date.now())), 'Default');
        this.todo.addTodo(new Todo('Do another thing', '', new Date(Date.now())), 'Default');

        this.todo.addProject('Project 2');
        this.todo.addTodo(new Todo('Project 2 todo, priority 100', '', new Date(Date.now()), 100), 'Project 2');
        this.todo.addTodo(new Todo('Project 2 todo, priority 1', '', new Date(Date.now())), 'Project 2');
        //

        this.populateProjects();
        this.populateProjectTodos('Default');
    }

    populateProjects() {
        for (const projName of this.todo.listProjects()) {
            const li = document.createElement('li');
            const button = document.createElement('button');

            button.textContent = projName;
            button.addEventListener('click', (e) => this.populateProjectTodos(e.target.textContent));

            li.appendChild(button);
            this.projOl.appendChild(li);
        }
    }

    populateProjectTodos(project) {
        this.todoOl.innerHTML = '';
        for (const todo of this.todo.listProjectTodos(project)) {
            const li = document.createElement('li');
            const button = document.createElement('button');

            button.textContent = todo.title;
            button.addEventListener('click', () => this.openTodoDetails(todo.id, project));

            li.appendChild(button);
            this.todoOl.appendChild(li);

        }
    }

    openTodoDetails(id, project) {
        const todo = this.todo.getTodo(id, project);
        console.log(todo);
    }
}
