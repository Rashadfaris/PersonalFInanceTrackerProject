[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/xIbq4TFL)


API End Points 

User Register
http://localhost:5000/api/user/register

By default it will register User 
json Body
{
    "name":"Rashad",
    "email":"it22295842@my.sliit.lk",
    "password":"pass"
}

User Login 
http://localhost:5000/api/user/login
{
    "email":"it22295842@my.sliit.lk",
    "password":"pass"
}

Admin Register 
http://localhost:5000/api/user/register
{
    "name":"Rashad",
    "email":"it22295842@my.sliit.lk",
    "password":"pass",
    "role" :"admin"
}

Admin Login 
{
    "email":"rashadfaris4675@gmail.com",
    "password":"admin123",
    "role":"admin"
}

Get all the transaction records 
http://localhost:5000/transactions

Make a Transaction 
http://localhost:5000/transactions

{
    "userId":"67cc10369e9ab0e4fc39cd09",
  "type": "expense",
  "amount": 50,
  "category": "Food",
  "tags": ["lunch", "restaurant"],
  "recurring": false
}

Get a transaction 
http://localhost:5000/transactions/67cc993d65d6098f0250bd5c


Updating a Transaction 
(Transaction ID is used)
http://localhost:5000/transactions/67cc993d65d6098f0250bd5c
{
  "type": "expense",
  "amount": 85,
  "category": "Food",
  "tags": ["dinner"],
  "recurring": false
}


Deleting a Transaction
(Transaction ID is used)
http://localhost:5000/transactions/67cc993d65d6098f0250bd5c

Get all the transaction related to the relevant user (User)
http://localhost:5000/transactions/user/67cc10369e9ab0e4fc39cd09

Budget creation 
http://localhost:5000/api/budget/create
{
  "userId": "67cc10369e9ab0e4fc39cd09",
  "category": "Food",
  "amount": 5000,
  "month": 3,
  "year": 2025,
  "budgetType": "monthly",  
  "spentAmount": 0
}


Budget Update
http://localhost:5000/api/budget/update/67cd5056d0cef365790c0a92
{
  "amountSpent": 500,
  "userId": "67cc10369e9ab0e4fc39cd09"
}

Deleting a budget 
http://localhost:5000/api/budget/delete/67cd5056d0cef365790c0a92




