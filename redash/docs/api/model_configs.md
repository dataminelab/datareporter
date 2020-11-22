## API for Models

- Create or update `model config` endpoint
```bash
POST http://{host}/api/models/{model id}/config

Required Permission: edit_model_config

Body:
{
    content: 'some json content', [required]
}

Response Types:

Status: 400 (Bad Request) either one of the required fields have not been sent or content is not json

Status: 403 (Unauthorized) if user doesn't have a edit_model_config permission

Status: 404 (Not Found) if model doesn't exist

Status: 200 (Ok)
{
    "id": config.id,
    "content": config.content,
    "user_id": config.user_id,
    "model_id": config.model_id,
    "created_at": config.created_at,
    "updated_at": config.updated_at,
}

```

- Get `model config` by it's id

```bash

GET http://{host}/api/model_configs/{config id}

Required Permission: view_model_config

Response Types:

Status: 403 (Unauthorized) either user doesn't have a view_model_config permission or not owner

Status: 404 (Not Found) if config doesn't exist

Status: 200 (Ok)
{
    "id": config.id,
    "content": config.content,
    "user_id": config.user_id,
    "model_id": config.model_id,
    "created_at": config.created_at,
    "updated_at": config.updated_at,
}
```
