require('dotenv').config();
const dynamoClient = require("./db");
const TableName = process.env.TABLE_NAME;

const request = require("supertest");
const todoDataService = require("./services/TodoDataService");
const App = require("./app");
const app = new App();
jest.useFakeTimers();

describe("Test public routes", () => {
  beforeEach(async () => {
    await dynamoClient.delete({ TableName, Key: { id: "0" } }).promise();
  });

  it("should respond with a 200 at /health", () => {
    return request(app).get("/health").expect(200);
  });

  it("should add a todo, returning it in an order and object mapped by id", () => {
    return request(app)
      .post("/api/todo-data")
      .send({
        name: "Add entry",
        desc: "Personal log",
        dateCreated: "1622077232207",
        tags: ["caput"],
        pomodoroCount: 0,
      })
      .expect(201)
      .then(({ body }, err) => {
        const todoId = body.order[0];
        const returnedTodo = body.todos[todoId];

        // Example response body
        // {
        //   "order": [
        //     "57f78108-4704-41a9-989b-3721ceedfad1"
        //   ],
        //   "todos": {
        //     "57f78108-4704-41a9-989b-3721ceedfad1": {
        //       "name": "Add entry",
        //       "desc": "Personal log",
        //       "dateCreated": "1622077232207",
        //       "dateCompleted": null,
        //       "tags": ["caput"],
        //       "pomodoroCount": 0
        //     }
        //   }
        // }

        expect(Array.isArray(body.order)).toBeTruthy();
        expect(returnedTodo.pomodoroCount).toEqual(0);
        expect(returnedTodo.name).toEqual("Add entry");
        expect(returnedTodo.desc).toEqual("Personal log");
        expect(returnedTodo.dateCreated).toEqual("1622077232207");
      });
  });
  
  it("should return all the todos saved, with the order", () => {
    const todo1 = {
      name: "Add entry",
      desc: "Personal log",
      dateCreated: "1622077232207",
      tags: ["caput"],
      pomodoroCount: 0,
    };
    const todo2 = {
      name: "Rep building",
      desc: "Physical training",
      dateCreated: "1622077232209",
      tags: ["manu"],
      pomodoroCount: 0,
    };
    return todoDataService
      .addTodo(todo1)
      .then(() => {
        return todoDataService.addTodo(todo2);
      })
      .then(() => {
        return request(app)
          .get("/api/todo-data")
          .expect(200)
          .then(({ body }) => {
            expect(body.order.length).toEqual(2);
          });
      });
  });

  it("should update the order of todos", () => {
    const todo1 = {
      name: "Add entry",
      desc: "Personal log",
      dateCreated: "1622077232207",
      tags: ["caput"],
      pomodoroCount: 0,
    };
    const todo2 = {
      name: "Rep building",
      desc: "Physical training",
      dateCreated: "1622077232209",
      tags: ["manu"],
      pomodoroCount: 0,
    };

    let todoId1;
    let todoId2;

    return todoDataService
      .addTodo(todo1)
      .then((response) => {
        todoId1 = response.order[0];
        return todoDataService.addTodo(todo2);
      })
      .then((response) => {
        todoId2 = response.order[1];
        return request(app)
          .patch("/api/todo-data")
          .send({
            order: [todoId2, todoId1],
          })
          .expect(204)
          .then(() => {
            return todoDataService.getTodos().then(({ order }) => {
              expect(Array.from(order)).toEqual([todoId2, todoId1]);
            });
          });
      });
  });

  it("should update a todo by id", () => {
    const todo1 = {
      name: "Add entry",
      desc: "Personal log",
      dateCreated: "1622077232207",
      tags: ["caput"],
      pomodoroCount: 0,
    };

    let todoId1;

    return todoDataService
      .addTodo(todo1)
      .then((response) => {
        todoId1 = response.order[0];
      })
      .then(() => {
        return request(app)
          .patch(`/api/todo-data/${todoId1}`)
          .send({
            name: "New Name",
            desc: "New Desc",
          })
          .expect(204)
          .then(() => {
            return todoDataService.getTodos();
          })
          .then((todoData) => {
            expect(todoData.todos[todoId1].name).toEqual("New Name");
            expect(todoData.todos[todoId1].desc).toEqual("New Desc");
          });
      });
  });

  it("should delete a todo by id", () => {
    const todo1 = {
      name: "Add entry",
      desc: "Personal log",
      dateCreated: "1622077232207",
      tags: ["caput"],
      pomodoroCount: 0,
    };
    const todo2 = {
      name: "Rep building",
      desc: "Physical training",
      dateCreated: "1622077232209",
      tags: ["manu"],
      pomodoroCount: 0,
    };

    let todoId1;
    let todoId2;

    return todoDataService
      .addTodo(todo1)
      .then((response) => {
        todoId1 = response.order[0];
        return todoDataService.addTodo(todo2);
      })
      .then((response) => {
        todoId2 = response.order[1];
        return request(app)
          .delete(`/api/todo-data/${todoId1}`)
          .expect(204)
          .then(() => {
            return todoDataService.getTodos();
          })
          .then(({ order, todos }) => {
            expect(order.length).toEqual(1);
            expect(todos[todoId1]).toBeFalsy();
          })
      })
  })
});
