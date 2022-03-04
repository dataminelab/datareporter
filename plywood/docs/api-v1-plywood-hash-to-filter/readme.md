## Api documentation

Transforms hash to turnillo filter object.

```http
POST /api/v1/plywood/hash-to-filter
```

`Body`

Body is turnillo filter object

```json
{
  "hash": "N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADTjTxKoY4DKZaG2A5lPqAMaYIEcAA5QyAJUwB3bngBmiMQF9qGALZlkOCgQCiaXgHoAqgBUAwlRByICNGQBOsgNqg0AT2E7CEDVYdkcvggQlBoAPowwgAm6BSqvmQACo5Y0S6g0TAO6Fi4BEkAjAAiVmFkwvgAtIWqnt5C9mEgSgC6bdRQwkhoGYT1wWEOEJxW0YnYUHnBNk4R2HB+nZgOaDwgAUEEcLwYYPH9XoOpZNzU4wG70wTRp7xk2OOj1F7DmNHBLdRIahBreABWAAMHRAYmGp3wrg2gUcD3uwR2ewOchWanQ6w8RxugTgMDsVjAiBg3i+h28GjgsACLVaLxG2DI0WKEymOBcdJAwgZTKYK3+ICREH2LSAA==="
}
```

Other responses than `200` should be considered as fail.

Response `200`:

```json
{
  "visualization": "table",
  "visualizationSettings": {
    "collapseRows": false
  },
  "timezone": "Etc/UTC",
  "filters": [
    {
      "type": "time",
      "ref": "last_update",
      "timePeriods": [
        {
          "duration": "P1D",
          "step": -1,
          "type": "latest"
        }
      ]
    }
  ],
  "splits": [
    {
      "type": "string",
      "dimension": "first_name",
      "sort": {
        "ref": "active",
        "type": "series",
        "direction": "descending",
        "period": ""
      },
      "limit": 50
    }
  ],
  "series": [
    {
      "reference": "active",
      "format": {
        "type": "default",
        "value": ""
      },
      "type": "measure"
    }
  ],
  "pinnedDimensions": [],
  "pinnedSort": "active"
}
```
