## Api documentation


```http
GET /api/v1/plywood/attributes/engines
```
## Responses

Response `200`

```json
{
    "supportedEngines": [
        "postgres",
        "aws",
        "athena",
        "druid",
        "mysql"
    ]
}
```

The `supportedEngines` attribute contains all engines that currently are supported for converting attributes


