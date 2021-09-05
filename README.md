# Deployed Application

[https://drawing-app-dev3-backend.herokuapp.com/draw/](https://drawing-app-dev3-backend.herokuapp.com/draw/)

Supported Browsers: Chome, Firefox

Browsers not supported: Safari

# Stacks Architecture

![architecture](/readmeImg/architecture.png)

React is used for front-end component while django framework is used as the backend component. React role is in this stack is to visualize the drawing elements and it's navbar components. Using [axios npm module](https://www.npmjs.com/package/axios#form-data) to consume API calls available in the backend.

Django framework utilized multiple building blocks to expose API services required by front-end. This application utilize [Django Rest framework](https://www.django-rest-framework.org) to expose database contents that has its schema defined and enforced by Django Models. Two internal Django application was created, one for Drawing application and another for user management. Each of these Django applications has its own models to maintain. Both DrawApp and Users models are protected by [Django Rest-Auth](https://github.com/Tivix/django-rest-auth), a module that expose APIs to register, authenticate and manage user accounts.

Rest-Auth authentication is implemented across all exposed APIs. Hence, when API calls are made to access the resources, users would have to be logged in (indicated by authenticated token) and by default, only drawings generated by its user can be accessible for RESTful Method operation (GET, POST, PUT, DELETE).

# How to run this Drawing App locally

1. Clone this repository on the `main` branch
2. Create Virtual Environment

```
$ python3 -m venv venv
```

3. activate virtual environment

```
$ pip install pipenv #python2, or,
$ pip3 install pipenv #python3
```

4. enter virtual environment shell

```
$ pipenv shell
```

5. install all Django dependencies

```
$ pip install requirements.txt
```

6. Build React front end

```
$ npm run build
```

7. Create migrations on your virtual environment

```
$ python manage.py makemigrations
```

8. Migrate Django backend models into DB

```
$ python manage.py migrate
```

9. Run the application

```
$ python manage.py runserver
```

The application is now accessible at:

- Drawing Page: [http://localhost:8000/draw](http://localhost:8000/draw)
- Admin Page: [http://localhost:8000/admin](http://localhost:8000/admin)
