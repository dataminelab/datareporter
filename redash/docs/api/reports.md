## API for Reports

### Create `report` endpoint
`POST` http://{host}/api/reports?format=base64

Required Permission: __create_report__


`Args`
```
format : 'base64' | 'json';  [optional,'base64']
If set response response value for expression will be returned
if 'base64' in string fotmat
if 'json' in json format

Default:'base64'
```

`Request`
```json
{
    "name" : "Report name",
    "model_id" : 1,  
    "expression" : "N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADTjTxKoY4DKZaG2A5lPqAMaYIEcAA5QyAJUwB3bngBmiMQF9qGALZlkOCgQCiaXgHoAqgBUAwlRByICNGQBOsgNqg0AT2E7CEDVYdkcvg+fqq+ZAAKjlgAJi6gMTAO6Fi4BBEAjAAiVlD2wvgAtBmqnt5C9nkgSgC6Km5lwcSYAmRwuNQBQQTQAHJkUlZgiDBkLmgOozXU2Jho+AoIytMgUMJIaPGEjQR5DhCcVjHh2FCpwfww2BPuAJJQmLmYDvN4oF3BcDExZDFWHl5gmJ9mMjhAArxGGkQD8oLwyNhjodqF59pg/gRqtQkGoIK8AKwABnq20BuwmBw4YI0p3OPSgAEFZth3GpMDBuNQHi8eCAPgQvj8/qUyatoqDqMcIVDgrD4YjKVZUbFgliQDi8fh8bUueKtl1HAj4Z9vr8rHJnmp0LyAd4fgoYHYhiNvGrbcENHBYAFqithAdsL8siczjgXCBeAALdqBhBWbBwDRrODG6jQSTNeZ+gO/JjPV4gQVmpRAA=",
    "color_1": "color_1",
    "color_2": "color_2"
}
```
`Response`

Status `404` (Not found) If the model was not  found or does not belong to the owner

Status `404` (Not found) Model object does not belong to the owner

Status: `403` (Unauthorized) if user doesn't have a create_report permission

Status: `400` (Bad request) if base64 string can not be decoded

Status: `400` (Bad request) If any the required fields are missing


Status `200`
```json
{
    "id": 1,
    "name": "Report name",
    "user_id": 1,
    "model_id": 1,
    "expression": "N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADTjTxKoY4DKZaG2A5lPqAMaYIEcAA5QyAJUwB3bngBmiMQF9qGALZlkOCgQCiaXgHoAqgBUAwlRByICNGQBOsgNqg0AT2E7CEDVYdkcvg+fqq+ZAAKjlgAJi6gMTAO6Fi4BBEAjAAiVlD2wvgAtBmqnt5C9nkgSgC6Km5lwcSYAmRwuNQBQQTQAHJkUlZgiDBkLmgOozXU2Jho+AoIytMgUMJIaPGEjQR5DhCcVjHh2FCpwfww2BPuAJJQmLmYDvN4oF3BcDExZDFWHl5gmJ9mMjhAArxGGkQD8oLwyNhjodqF59pg/gRqtQkGoIK8AKwABnq20BuwmBw4YI0p3OPSgAEFZth3GpMDBuNQHi8eCAPgQvj8/qUyatoqDqMcIVDgrD4YjKVZUbFgliQDi8fh8bUueKtl1HAj4Z9vr8rHJnmp0LyAd4fgoYHYhiNvGrbcENHBYAFqithAdsL8siczjgXCBeAALdqBhBWbBwDRrODG6jQSTNeZ+gO/JjPV4gQVmpRAA=",
    "created_at": "2021-05-06T18:04:16.468Z",
    "updated_at": "2021-05-06T18:04:16.468Z",
    "color_1": "color_1",
    "color_2": "color_2"
}
```

### Get list `report` endpoint

`GET` http://{host}/api/reports?format=base64

Required Permission: __view_report__


`Args`
```
format : 'base64' | 'json';  [optional,'base64']
If set response response value for expression will be returned
if 'base64' in string fotmat
if 'json' in json format
Default:'base64'

page : number [optional]
Cursor for pagination default is 1

page_size :number [optional]
Cursor for pagination default is 25

```

Status

Status: `403` (Unauthorized) if user doesn't have a view_report permission

Status `200`
```json
{
    "count": 3,
    "page": 1,
    "page_size": 25,
    "results": [
        {
            "id": 3,
            "name": "My test report",
            "user_id": 1,
            "model_id": 1,
            "expression": "N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADTjTxKoY4DKZaG2A5lPqAMaYIEcAA5QyAJUwB3bngBmiMQF9qGALZlkOCgQCiaXgHoAqgBUAwlRByICNGQBOsgNqg0AT2E7CEDVYdkcvg+fqq+ZAAKjlgAJi6gMTAO6Fi4BBEAjAAiVlD2wvgAtBmqnt5C9nkgSgC6Km5lwcSYAmRwuNQBQQTQAHJkUlZgiDBkLmgOozXU2Jho+AoIytMgUMJIaPGEjQR5DhCcVjHh2FCpwfww2BPuAJJQmLmYDvN4oF3BcDExZDFWHl5gmJ9mMjhAArxGGkQD8oLwyNhjodqF59pg/gRqtQkGoIK8AKwABnq20BuwmBw4YI0p3OPSgAEFZth3GpMDBuNQHi8eCAPgQvj8/qUyatoqDqMcIVDgrD4YjKVZUbFgliQDi8fh8bUueKtl1HAj4Z9vr8rHJnmp0LyAd4fgoYHYhiNvGrbcENHBYAFqithAdsL8siczjgXCBeAALdqBhBWbBwDRrODG6jQSTNeZ+gO/JjPV4gQVmpRAA=",
            "created_at": "2021-05-06T18:04:16.468Z",
            "updated_at": "2021-05-06T18:04:16.468Z"
        },
        {
            "id": 2,
            "name": "My test report",
            "user_id": 1,
            "model_id": 1,
            "expression": "N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADTjTxKoY4DKZaG2A5lPqAMaYIEcAA5QyAJUwB3bngBmiMQF9qGALZlkOCgQCiaXgHoAqgBUAwlRByICNGQBOsgNqg0AT2E7CEDVYdkcvg+fqq+ZAAKjlgAJi6gMTAO6Fi4BBEAjAAiVlD2wvgAtBmqnt5C9nkgSgC6Km5lwcSYAmRwuNQBQQTQAHJkUlZgiDBkLmgOozXU2Jho+AoIytMgUMJIaPGEjQR5DhCcVjHh2FCpwfww2BPuAJJQmLmYDvN4oF3BcDExZDFWHl5gmJ9mMjhAArxGGkQD8oLwyNhjodqF59pg/gRqtQkGoIK8AKwABnq20BuwmBw4YI0p3OPSgAEFZth3GpMDBuNQHi8eCAPgQvj8/qUyatoqDqMcIVDgrD4YjKVZUbFgliQDi8fh8bUueKtl1HAj4Z9vr8rHJnmp0LyAd4fgoYHYhiNvGrbcENHBYAFqithAdsL8siczjgXCBeAALdqBhBWbBwDRrODG6jQSTNeZ+gO/JjPV4gQVmpRAA=",
            "created_at": "2021-05-06T18:02:12.947Z",
            "updated_at": "2021-05-06T18:02:12.947Z"
        },
        {
            "id": 1,
            "name": "My test report",
            "user_id": 1,
            "model_id": 1,
            "expression": "N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADTjTxKoY4DKZaG2A5lPqAMaYIEcAA5QyAJUwB3bngBmiMQF9qGALZlkOCgQCiaXgHoAqgBUAwlRByICNGQBOsgNqg0AT2E7CEDVYdkcvg+fqq+ZAAKjlgAJi6gMTAO6Fi4BBEAjAAiVlD2wvgAtBmqnt5C9nkgSgC6Km5lwcSYAmRwuNQBQQTQAHJkUlZgiDBkLmgOozXU2Jho+AoIytMgUMJIaPGEjQR5DhCcVjHh2FCpwfww2BPuAJJQmLmYDvN4oF3BcDExZDFWHl5gmJ9mMjhAArxGGkQD8oLwyNhjodqF59pg/gRqtQkGoIK8AKwABnq20BuwmBw4YI0p3OPSgAEFZth3GpMDBuNQHi8eCAPgQvj8/qUyatoqDqMcIVDgrD4YjKVZUbFgliQDi8fh8bUueKtl1HAj4Z9vr8rHJnmp0LyAd4fgoYHYhiNvGrbcENHBYAFqithAdsL8siczjgXCBeAALdqBhBWbBwDRrODG6jQSTNeZ+gO/JjPV4gQVmpRAA=",
            "created_at": "2021-05-05T11:28:28.796Z",
            "updated_at": "2021-05-05T11:28:28.796Z"
        }
    ]
}
```

### Get `report` by id endpoint


`GET` http://{host}/api/reports/:id?format=base64

Required Permission: __view_report__

`Args`
```
format : 'base64' | 'json';  [optional,'base64']
If set response response value for expression will be returned
if 'base64' in string fotmat
if 'json' in json format

Default:'base64'
```

`Response`

Status `404` (Not found) If the report is not found

Status: `403` (Unauthorized) if user doesn't have a view_report

Status: `403` (Unauthorized) if  user is not the owner


```json
{
    "id": 1,
    "name": "My test report",
    "user_id": 1,
    "model_id": 1,
    "expression": "N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADTjTxKoY4DKZaG2A5lPqAMaYIEcAA5QyAJUwB3bngBmiMQF9qGALZlkOCgQCiaXgHoAqgBUAwlRByICNGQBOsgNqg0AT2E7CEDVYdkcvg+fqq+ZAAKjlgAJi6gMTAO6Fi4BBEAjAAiVlD2wvgAtBmqnt5C9nkgSgC6Km5lwcSYAmRwuNQBQQTQAHJkUlZgiDBkLmgOozXU2Jho+AoIytMgUMJIaPGEjQR5DhCcVjHh2FCpwfww2BPuAJJQmLmYDvN4oF3BcDExZDFWHl5gmJ9mMjhAArxGGkQD8oLwyNhjodqF59pg/gRqtQkGoIK8AKwABnq20BuwmBw4YI0p3OPSgAEFZth3GpMDBuNQHi8eCAPgQvj8/qUyatoqDqMcIVDgrD4YjKVZUbFgliQDi8fh8bUueKtl1HAj4Z9vr8rHJnmp0LyAd4fgoYHYhiNvGrbcENHBYAFqithAdsL8siczjgXCBeAALdqBhBWbBwDRrODG6jQSTNeZ+gO/JjPV4gQVmpRAA=",
    "created_at": "2021-05-05T10:46:32.887Z",
    "updated_at": "2021-05-05T10:46:32.887Z"
}
```


### edit `report` by id endpoint

`POST` http://{host}/api/reports/:id?format=base64

Required Permission: __edit_report__

`Args`
```
format : 'base64' | 'json';  [optional,'base64']
If set response response value for expression will be returned
if 'base64' in string fotmat
if 'json' in json format

Default:'base64'
```

`Request`
```json
{
    "name" : "Report name", 
    "model_id" : 4, 
    "expression" : "N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADTjTxKoY4DKZaG2A5lPqAMaYIEcAA5QyAJUwB3bngBmiMQF9qGALZlkOCgQCiaXgHoAqgBUAwlRByICNGQBOsgNqg0AT2E7CEDVYdkcvg+fqq+ZAAKjlgAJi6gMTAO6Fi4BBEAjAAiVlD2wvgAtBmqnt5C9nkgSgC6Km5lwcSYAmRwuNQBQQTQAHJkUlZgiDBkLmgOozXU2Jho+AoIytMgUMJIaPGEjQR5DhCcVjHh2FCpwfww2BPuAJJQmLmYDvN4oF3BcDExZDFWHl5gmJ9mMjhAArxGGkQD8oLwyNhjodqF59pg/gRqtQkGoIK8AKwABnq20BuwmBw4YI0p3OPSgAEFZth3GpMDBuNQHi8eCAPgQvj8/qUyatoqDqMcIVDgrD4YjKVZUbFgliQDi8fh8bUueKtl1HAj4Z9vr8rHJnmp0LyAd4fgoYHYhiNvGrbcENHBYAFqithAdsL8siczjgXCBeAALdqBhBWbBwDRrODG6jQSTNeZ+gO/JjPV4gQVmpRAA=" // [required] <- BASE64 string taken from turnillo query
}
```

Status `404` (Not found) If the report is not found

Status: `403` (Unauthorized) if user doesn't have a edit_report permission

Status: `403` (Unauthorized) If user is not owner of new model object

Status: `400` (Bad request) if model_id can not be found in database

Status: `200`

```json
{
    "id": 1,
    "name": "My test report",
    "user_id": 1,
    "model_id": 1,
    "expression": "N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADTjTxKoY4DKZaG2A5lPqAMaYIEcAA5QyAJUwB3bngBmiMQF9qGALZlkOCgQCiaXgHoAqgBUAwlRByICNGQBOsgNqg0AT2E7CEDVYdkcvg+fqq+ZAAKjlgAJi6gMTAO6Fi4BBEAjAAiVlD2wvgAtBmqnt5C9nkgSgC6Km5lwcSYAmRwuNQBQQTQAHJkUlZgiDBkLmgOozXU2Jho+AoIytMgUMJIaPGEjQR5DhCcVjHh2FCpwfww2BPuAJJQmLmYDvN4oF3BcDExZDFWHl5gmJ9mMjhAArxGGkQD8oLwyNhjodqF59pg/gRqtQkGoIK8AKwABnq20BuwmBw4YI0p3OPSgAEFZth3GpMDBuNQHi8eCAPgQvj8/qUyatoqDqMcIVDgrD4YjKVZUbFgliQDi8fh8bUueKtl1HAj4Z9vr8rHJnmp0LyAd4fgoYHYhiNvGrbcENHBYAFqithAdsL8siczjgXCBeAALdqBhBWbBwDRrODG6jQSTNeZ+gO/JjPV4gQVmpRAA=",
    "created_at": "2021-05-05T10:46:32.887Z",
    "updated_at": "2021-05-05T10:46:32.887Z"
}
```

### delete `report` by id endpoint

`DELETE` http://{host}/api/reports/:id

Required Permission: __edit_report__

Status `404` (Not found) If the report is not found

Status `403` (Unauthorized) If there is no edit_report permission

Status `403` (Unauthorized) If the object is not the owner


Status `204` (No content)  Deleted, all went well.

