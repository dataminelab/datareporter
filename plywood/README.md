### How to run on local environment?

```bash
docker-compose up -d
```

### Is the service running?

```bash
docker-compose ps
```

### Endpoints

- Service status
    
    URL
    
    ```bash
    GET http://0.0.0.0:3000/api/v1/status
    ```
    
    Response
    
    ```json
    {"status":"UP"}
    ```

- Expression to SQL

    URL
    ```bash
    POST http://0.0.0.0:3000/api/v1/plywood
    ```
    
    Request Body
    ```json
    {
        "dataCube": "wiki",
        "context": {
            "engine": "mysql",
            "source": "wikipedia",
            "timeAttribute": "time",
            "attributes": [
                {"name": "time", "type": "TIME"},
                {"name": "page", "type": "STRING"},
                {"name": "language", "type": "STRING"},
                {"name": "added", "type": "NUMBER"}
            ]
        },
        "expression": {
            "op": "apply",
            "operand": {
                "op": "apply",
                "operand": {"op": "literal", "value": {"attributes": [], "data": [{}]}, "type": "DATASET"},
                "expression": {"op": "count", "operand": {"op": "ref", "name": "wiki"}},
                "name": "Count"
            },
            "expression": {
                "op": "sum",
                "operand": {"op": "ref", "name": "wiki"},
                "expression": {"op": "ref", "name": "added"}
            },
            "name": "TotalAdded"
        }
    }
    ```
    curl: `curl -XPOST http://localhost:3000/api/v1/plywood -H "Content-type: application/json" -d '{"dataCube":"wiki","context":{"engine":"bigquery","source":"wikipedia","timeAttribute":"time","attributes":[{"name":"time","type":"TIME"},{"name":"page","type":"STRING"},{"name":"language","type":"STRING"},{"name":"added","type":"NUMBER"}]},"expression":{"op":"apply","operand":{"op":"apply","operand":{"op":"literal","value":{"attributes":[],"data":[{}]},"type":"DATASET"},"expression":{"op":"count","operand":{"op":"ref","name":"wiki"}},"name":"Count"},"expression":{"op":"sum","operand":{"op":"ref","name":"wiki"},"expression":{"op":"ref","name":"added"}},"name":"TotalAdded"}}'`

    Response
    ```json
    [
        [
            "SELECT COUNT(*) AS `Count`, SUM(`added`) AS `TotalAdded` FROM `wikipedia` GROUP BY ''"
        ]
    ]
    ```

## Troubles installing a new dialect

Make sure to run `npm install dataminelab/plywood#bigquery-support` (#bigquery-support is the branch name here) so npm pulls the latest commit and updates package-lock.json