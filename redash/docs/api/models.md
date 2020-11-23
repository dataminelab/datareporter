## API for Models

- Create `model` endpoint
```bash
POST http://{host}/api/models

Required Permission: create_model

Body:
{
    name: 'Model name', [required]
    data_source_id: {id of the data source}, [required]
}

Response Types:

Status: 400 (Bad Request) if one of the required fields have not been sent

Status: 403 (Unauthorized) if user doesn't have a create_model permission

Status: 404 (Not Found) if data source doesn't exist

Status: 200 (Ok)
{
    "id": model.id,
    "name": model.name,
    "user_id": model.user_id,
    "data_source_id": model.data_source_id,
    "created_at": model.created_at,
    "updated_at": model.updated_at,
}

```

- Get `model` by it's id

```bash

GET http://{host}/api/models/{model.id}

Required Permission: view_model

Response Types:

Status: 403 (Unauthorized) if user doesn't have a view_model permission

Status: 404 (Not Found) if model doesn't exist

Status: 200 (Ok)
{
    "id": model.id,
    "name": model.name,
    "user_id": model.user_id,
    "data_source_id": model.data_source_id,
    "created_at": model.created_at,
    "updated_at": model.updated_at,
}
```
- Edit `model` by it's id

```bash

POST http://{host}/api/models/{model.id}

Required Permission: edit_model

Body:
{
    name: 'Model name', [optional]
    data_source_id: {id of the data source}, [optional]
}

Response Types:

Status: 403 (Unauthorized) if user doesn't have a edit_model permission

Status: 404 (Not Found) if model doesn't exist / if data source doesn't exist

Status: 200 (Ok)
{
    "id": model.id,
    "name": model.name,
    "user_id": model.user_id,
    "data_source_id": model.data_source_id,
    "created_at": model.created_at,
    "updated_at": model.updated_at,
}
```
- Delete `model` by it's id

```bash

DELETE http://{host}/api/models/{model.id}

Required Permission: admin or should be owner of the model

Body:
{
    name: 'Model name', [optional]
    data_source_id: {id of the data source}, [optional]
}

Response Types:

Status: 403 (Unauthorized) if user is neither admin nor owner

Status: 404 (Not Found) if model doesn't exist

Status: 204 (No Content)
```

- Get current user's `models`
```bash
GET http://{host}/api/models?page=1&page_size=25

Note: page and page_size optional GET parameters

Required Permission: view_model

Response Types:

Status: 403 (Unauthorized) if user doesn't have a view_model permission

Status: 200 (Ok)
{
    "count": count,
    "page": page,
    "page_size": page_size,
    "results": [
        {
            "id": model.id,
            "name": model.name,
            "user_id": model.user_id,
            "data_source_id": model.data_source_id,
            "created_at": model.created_at,
            "updated_at": model.updated_at,
        },
        ...
    ]
}
```
