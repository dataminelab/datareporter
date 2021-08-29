## API for Models

- Create `model` endpoint
```bash
POST http://{host}/api/models

Required Permission: create_model

Body:
{
    name: 'Model name', [required] <- Name for the model
    data_source_id: 1, [required] <- id of data source
    table : 'users', [required] <- Name of the table in the db
    content : '
                dataCubes:
                  - name: users

                    title: Users

                    timeAttribute: time

                    clusterName: native

                    defaultSortMeasure: id

                    defaultSelectedMeasures:

                      - id

                    attributes:

                      - name: api_key
                        type: CHARACTER VARYING

                      - name: email
                        type: CHARACTER VARYING

                    dimensions:

                      - name: api_key
                        title: Api Key
                        formula: $api_key


                      - name: email
                        title: Email
                        formula: $email


                    measures:

                      - name: id
                        title: Id
                        formula: $main.sum($id)

    ', [optional] <- string content of the model
   (If passed the model will not be generated from the table but from the passed content)




}

Response Types:

Status: 400 (Bad Request) if one of the required fields have not been sent,
                          If the validation of content did not work
                           {
                                "message" : "error at line 12 position 2"
                           }


Status: 403 (Unauthorized) if user doesn't have a create_model permission

Status: 404 (Not Found) if data source doesn't exist

Status: 200 (Ok)
{
    "id": model.id,
    "name": model.name,
    "user_id": model.user_id,
    "data_source_id": model.data_source_id,
    "table": model.table,
    "model_config_id": : model.config.id ,
    "created_at": model.created_at,
    "updated_at": model.updated_at,
}
Example
{
    "id": 3,
    "name": "ELon musk",
    "user_id": 1,
    "data_source_id": 1,
    "table": "users",
    "model_config_id": 3,
    "created_at": "2021-04-30T14:34:25.096Z",
    "updated_at": "2021-04-30T14:34:25.096Z"
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
