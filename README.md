# Pomotodo Backend with DynamoDB

## Requirements
- node (tested with versions 10+)
- AWS account with DynamoDB and IAM role with Programmatic Access

## Installation
- `npm install`

## Usage
1. Create a DynamoDB table called "tododata" with a Primary Key: "tododata" as String
1. Create a .env file with the following values
  ```
  PORT=5000
  TABLE_NAME=tododata
  AWS_ACCESS_KEY_ID=******************
  AWS_SECRET_ACCESS_KEY=****************
  AWS_DEFAULT_REGION=****************
  ```
1. `npm start`

## Exercise
Two test suites have been created to ensure a reliable refactor of this application from using MongoDB with Mongoose to using the AWS SDK for DynamoDB. The DynamoDB connection has been set up in the "db" directory. 
1. Begin in the "services" directory, run the Jest test suite with `npm test`, and make your changes in "todoDataService.js". The [AWS SDK DynamoDB Document Client Docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html) and [Using Javascript Promises with AWS SDK Requests](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/using-promises.html) will be most helpful
1. Work on one test at a time. Use console.log()'s where necessary to see what you're doing. Don't forget to refresh your DynamoDB table in the Management Console to see the Items update there as well.
1. Once all your service tests are passing, see the "app.test.js" suite in the project's root directory. Remove the "x" before the main "describe" block to enable this test suite. Run `npm test` again and if all goes well, these integration tests should work, too. 
1. Run a manual test by hooking up your the pomotodo-frontend to use the newly DynamoDB connected backend! 

## Stories and Acceptance Criteria
### Example TODO body

```json
{
  "id" : "0",
  "order": [
    "57f78108-4704-41a9-989b-3721ceedfad1"
  ],
  "todos": {
    "57f78108-4704-41a9-989b-3721ceedfad1": {
      "name": "Add entry",
      "desc": "Personal log",
      "dateCreated": "1622077232207",
      "dateCompleted": "1622077232208",
      "pomodoroCount": 2
    }
  }
}
```

### Example TODO order body

```json
[
  "57f78108-4704-41a9-989b-3721ceedfad1",
  "3b23c502-9ac3-45cc-87d6-2221e69fa2b4",
  "06044689-64dc-4408-a6d3-8936f559c119"
]
```

---

As a user, I want to save a todo so that I can see it upon revisiting

    Given I have the details of my todo
    When I add a todo
    Then my todo is saved

POST /api/todo-data
201 Created

Request Body:

```json
{
  "name": "Add entry",
  "desc": "Personal log",
}
```

Response Body:

```json
{
  "id" : "0"
  "order": [
    "57f78108-4704-41a9-989b-3721ceedfad1"
  ],
  "todos": {
    "57f78108-4704-41a9-989b-3721ceedfad1": {
      "name": "Add entry",
      "desc": "Personal log",
      "dateCreated": "1622077232207",
      "dateCompleted": "null",
      "pomodoroCount": 0
    }
  }
}
```

---

As a user, I want to view all of my saved todos in order

    Given I have saved multiple todos
    When I try to get all of my todos
    Then I get a list of my todos in order by id

GET /api/todo-data
200 OK

Response Body:
```json
{
  "id" : "0"
  "order": [
    "57f78108-4704-41a9-989b-3721ceedfad1",
    "21f3e843-b7c0-4ddb-8df4-0111117bf2d8"
  ],
  "todos": {
      "57f78108-4704-41a9-989b-3721ceedfad1": {
        "name": "Add entry",
        "desc": "Personal log",
        "dateCreated": "1622077232207",
        "dateCompleted": "null",
        "pomodoroCount": 0
      },
      "21f3e843-b7c0-4ddb-8df4-0111117bf2d8": {
        "name": "Rep Building",
        "desc": "Physical Training",
        "dateCreated": "1622077232209",
        "dateCompleted": "null",
        "pomodoroCount": 0
      }
    }
  }
}
```
---
As a user I want to update the order of my todos

    Given I have saved several todos
    When I change the order of them
    Then the order of the todo is saved so that when I revisit, it has peristed

PATCH /api/todo-data
204 No content

Request Body: 
```json
{
  "id" : "0"
  "order": [
    "d6b2e215-f095-402e-bf31-f75154a69329",
    "e61cf002-5fa4-41a2-9ace-a7bf4a284d33",
    "9b314719-0500-4e2f-a0f8-171b96766741"
  ]
}
```
---

As as user, I want to update a todo when I complete it

    Given I have saved a todo
    When I update a todo's completion date
    Then I my todo has an updated completion date

PATCH /api/todo-data/{todo-id}
204 No Content


Request Body:
```json
{
  "dateCompleted": "1622083278575"
}
```
As a user I want to update a todos name or description

    Given I have saved a todo
    When I update a todos name OR description
    Then the updated changes are saved

PATCH /api/todo-data/{todo-id}
204 No Content


Request Body:
```json
{
  "name": "WORKOUTMOAR",
  "desc": "Physical Training",
}
```


As a user I want to be able to record how many pomodoro intervals I have completed for a todo

    Given I have saved a todo
    When I complete a pomodoro interval with a chosen todo
    Then my todo has the saved pomodoro interval count

PATCH /api/todo-data/{todo-id}
204 No Content


Request Body:
```json
{
  "pomodoroCount": 1
}
```