# sales_inventory_system_ml
Sales and Inventory Management System using Machine Learning

Sistema de Gestión de Ventas e Inventarios que integra modelos de predicción mediante Machine Learning.

El proyecto está compuesto por tres módulos principales:

* Backend API -- Spring Boot + PostgreSQL
* Frontend Web -- Angular
* Servicio ML --- Python

## Requisitos Previos
Para ejecutra el proyecto debe tener instalados:

1. Docker

2. Java 21+

3. Node.js 22+ y Angular CLI

4. Python 3.10+

## Ejecución del Proyecto
A continuación se detalla cómo levantar cada módulo del sistema.

### 1. Backend -- Srping Boot + PostgreSQL (Docker)
Ubicación recomendada: ```/backend-simsml```

1.1. Levantar PostgreSQL con Docker

```
docker run --name simsml-container -e POSTGRES_DB=db-simsml -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

Nota: En caso de haber cambiado las propiedades del comando anterior, se deben configurar las propiedad del application.yml

1.2. Ejecutar el Backend Spring Boot

Para ejecutar el backend puede hacerlo ingresando desde el editor IntelliJ Idea o mediante una terminal ejecutando:
```
mvn BackendSimsmlApplication:run
```
Nota: Para ejecutarlo mediante el comando debe tener maven instalado.

### 2. Frontend Angular
Ubicación recomendada: ```/frontend-simsml```

2.1. Instalar dependencias
```
npm i
```
2.2. Levantar el servidor de desarrollo
```
ng serve -o
```
Por defecto abrirá ```http://localhost:4200```
### 3. Servicio de Machine Learning - Python
Ubicación recomendada ```/ml-simsml```

3.1. Crear entorno virtual

Crear venv
```
python -m venv venv
```
Activar
```
./venv/Scripts/activate
```

3.2. Instalar dependencias
```
pip install -r requirements.txt
```

3.3. Ejecutar el servicio ML
```
uvicorn src.api:app --reload
```
Por defecto abrirá ```http://localhost:8000```

## Flujo de Ejecución completo
1. Levantar Base de Datos
```
docker run --name simsml-container -e POSTGRES_DB=db-simsml -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```
2. Ejecutar Bakcend Spring Boot
```
mvn BackendSimsmlApplication:run
```
3. Ejecutar Servicio ML
```
uvicorn src.api:app --reload
```
4. Levantar Angular
```
ng serve -o
```