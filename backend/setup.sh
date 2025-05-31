#!/bin/bash

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip3 install -r requirements.txt

# Create Django project
django-admin startproject core .

# Create apps with unique names
python3 manage.py startapp user_management
python3 manage.py startapp music_logs
python3 manage.py startapp music_ratings

# Create necessary directories
mkdir -p media static

# Make migrations for each app
python3 manage.py makemigrations user_management
python3 manage.py makemigrations music_logs
python3 manage.py makemigrations music_ratings

# Apply migrations
python3 manage.py migrate

echo "Django project setup complete!"
echo "Don't forget to create a superuser with: python3 manage.py createsuperuser" 