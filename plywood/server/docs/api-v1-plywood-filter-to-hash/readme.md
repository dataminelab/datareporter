## Api documentation

Transforms turnillo filter json to hash version 4.

```http
POST /api/v1/plywood/filter-to-hash
```

`Body`

Body is turnillo filter object

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
    },
    {
      "type": "string",
      "ref": "first_name",
      "action": "in",
      "values": ["Tracy", "Leslie"],
      "not": false
    }
  ],
  "splits": [],
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
  "pinnedSort": "active",
  "timeShift": "P3M"
}
```

Other responses than `200` should be considered as fail.

Response `200`:

```json
{
  "hash": "N4IgbglgzgrghgGwgLzgFwgewHYgFwhpwBGCApiADTjTxKoY4DKZaG2A5lPqAMaYIEcAA5QyAJUwB3bngBmiMQF9qGALZlkOCgQCiaXgHoAqgBUAwlRByICNGQBOsgNqg0AT2E7CEDVYdkcvggQlBoAPowwgAm6BSqvmQACo5Y0S6g0TAO6Fi4BEkAjAAiVmFkwvgAtIWqnt5C9mEgSgC6Km71wWEOEJz+gcE2ThHYcH7UcLyM+SB9VmCIMGQuIKY5vO5WADIrSBSt1NiYaPgKCMqHIFDCSGguV2K9K/iuIAFyjmTYvN5TGGB4tZMA41OgeIQugRooE4DA7Aslt4WnUvMENHBYAEWldhH1sGRosVEtgoHkHtQ8dgCdEmCDTgR/hBAVZ1GQmAALCByBkgJIAZgAsi0gA="
}
```
