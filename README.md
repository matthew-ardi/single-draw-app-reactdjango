# Deployed Application

[https://drawing-app-dev3-backend.herokuapp.com/draw/](https://drawing-app-dev3-backend.herokuapp.com/draw/)

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
