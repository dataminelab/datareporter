## Api documentation

```http
POST /api/v1/plywood/attributes
```

`Body`

| Key          | Type     | Description                                                  |
| :----------- | :------- | :----------------------------------------------------------- |
| `engine`     | `string` | **Required**. Engine for attributes                          |
| `attributes` | `array`  | **Required**. Array of attributes that needs to be converted |

`attributes` Array of objects that should contains

```json
{
    "name" : "name_of_field",
    "type":  "type_of_database"
}
```

Example:

```json
{
  "engine": "postgres",
  "attributes": [
    {
      "name": "api_key",
      "type": "CHARACTER VARYING"
    },
    {
      "name": "created_at",
      "type": "TIMESTAMP WITH TIME ZONE"
    },
    {
      "name": "details",
      "type": "JSON"
    },
    {
      "name": "disabled_at",
      "type": "TIMESTAMP WITH TIME ZONE"
    },
    {
      "name": "email",
      "type": "CHARACTER VARYING"
    },
    {
      "name": "groups",
      "type": "ARRAY"
    }
  ]
}
```

Response `200`:

| Key          | Type    | Description                          |
| :----------- | :------ | :----------------------------------- |
| `attributes` | `array` | Converted attributes with new types. |

`attributes` Array of objects contains

```json
{
  "nativeType": "CHARACTER VARYING",
  "name": "api_key",
  "type": "STRING",
  "isSupported": true
}
```

| Key           | Type      | Description                    |
| :------------ | :-------- | :----------------------------- |
| `nativeType`  | `string`  | Initial typeOfColumn.          |
| `name`        | `string`  | Initial name of column .       |
| `type`        | `string`  | Plywood data type, converted . |
| `isSupported` | `boolean` | Is data type supported .       |

Response `400`

If it was field error, there will be message and field,

if not just message

```json
{
  "message": "Engine is missing",
  "field": "engine"
}
```

Or

```json
{
  "message": "Type is missing in attributes at index 0",
  "field": "attributes.type"
}
```
