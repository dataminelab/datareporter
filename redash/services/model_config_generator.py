import json
from typing import List

import yaml
from inflection import titleize

from redash.models.models import Model
from redash.plywood.plywood import PlywoodApi

INDENT_LEVELS = [3, 4]

BOOLEAN = "BOOLEAN"
NUMBER = "NUMBER"
TIME = "TIME"

DIMENSION_KINDS = (BOOLEAN, NUMBER, TIME)
MEASURE_TYPES = (NUMBER,)
TIME_ATTRIBUTE_TYPES = (TIME,)


class ConfigDumper(yaml.SafeDumper):
    def write_line_break(self, data=None):
        super(ConfigDumper, self).write_line_break(data)
        if len(self.indents) in INDENT_LEVELS:
            super(ConfigDumper, self).write_line_break()

    def increase_indent(self, flow=False, indentless=False):
        return super(ConfigDumper, self).increase_indent(flow, False)


class BaseConfig(object):
    def to_json(self):
        raise NotImplementedError()

    def to_yaml(self):
        return yaml.dump(self.to_json(), Dumper=ConfigDumper, sort_keys=False, default_flow_style=False)


class PlywoodAttribute(BaseConfig):

    def __init__(self, name, type_: str, native_type: str, is_supported: bool):
        self.name = name
        self.type_ = type_
        self.native_type = native_type
        self.is_supported = is_supported

    def to_json(self):
        native_type = self.native_type.upper()

        if 'SET' in self.type_:
            native_type = "ARRAY/" + native_type

        return {
            "name": self.name,
            "type": self.type_.upper(),
            "nativeType": native_type
        }


class Attribute(BaseConfig):
    def __init__(self, name: str, kind: str):
        self.name = name
        self.kind = kind

    def to_json(self):
        return {
            "name": self.name,
            "type": self.kind.upper()
        }


class Dimension(Attribute):
    def __init__(self, name, kind):
        super().__init__(name, kind)

    def to_json(self):
        json_data = {
            "name": self.name,
            "title": titleize(self.name),
            "formula": "${}".format(self.name)
        }
        if self.kind.upper() in DIMENSION_KINDS:
            json_data["kind"] = self.kind
        return json_data


class Measure(Attribute):
    def __init__(self, name, kind):
        super().__init__(name, kind)

    def to_json(self):
        return {
            "name": self.name,
            "title": titleize(self.name),
            "formula": "${}.sum(${})".format("main", self.name)
        }


class ModelConfigAttributes(BaseConfig):
    def __init__(self, name, attributes: List[PlywoodAttribute], dimensions, measures):
        self.name = name
        self.attributes = attributes
        self.dimensions = dimensions
        self.measures = measures

    def to_json(self):
        return self._build()

    @staticmethod
    def _attributes_filter(attributes: List[PlywoodAttribute]) -> List[PlywoodAttribute]:
        res = []

        for attribute in attributes:
            if attribute.is_supported:
                res.append(attribute)

        return res

    def _build(self):
        attributes = [attribute.to_json() for attribute in self._attributes_filter(self.attributes)]

        data_cube_config = {
            "name": self.name,
            "title": titleize(self.name),
            "timeAttribute": self._find_time_attribute(),
            "clusterName": "native",
            "defaultSortMeasure": self._find_default_sort_measure(),
            "defaultSelectedMeasures": self._find_default_selected_measures(),
            "attributes": attributes,
            "dimensions": [dimension.to_json() for dimension in self.dimensions],
            "measures": [measure.to_json() for measure in self.measures]
        }

        return {
            "dataCubes": [
                data_cube_config
            ]
        }

    def _find_default_sort_measure(self):
        first_measure = next(iter(self.measures), None)
        return first_measure.name if first_measure else None

    def _find_default_selected_measures(self):
        measure = self._find_default_sort_measure()
        return [measure] if measure else []

    def _find_time_attribute(self):
        for attribute in self.attributes:
            if attribute.type_.upper() in TIME_ATTRIBUTE_TYPES:
                return attribute.name
        return None


class ModelConfigGenerator(object):
    @staticmethod
    def yaml(model: Model, refresh=False):
        config_attributes = ModelConfigGenerator._build(model, refresh)

        return config_attributes.to_yaml()

    @staticmethod
    def json(model: Model, refresh=False):
        config_attributes = ModelConfigGenerator._build(model, refresh)

        return config_attributes.to_json()

    @staticmethod
    def _build(model: Model, refresh):

        schemas = model.data_source.get_schema(refresh=refresh)
        table_schema = next((schema for schema in schemas if schema["name"] == model.table), None)
        if table_schema is None:
            raise ValueError("Data source {} doesn't contain {} table".format(model.data_source, model.table))

        attributes = ModelConfigGenerator.find_attributes(model, table_schema)
        plywood_attributes = ModelConfigGenerator.convert_attributes(model, attributes)

        dimensions = ModelConfigGenerator.find_dimensions(plywood_attributes)
        measures = ModelConfigGenerator.find_measures(plywood_attributes)

        return ModelConfigAttributes(name=model.table, attributes=plywood_attributes, dimensions=dimensions,
                                     measures=measures)

    @staticmethod
    def convert_attributes(model: Model, attributes: List[Attribute]) -> List[PlywoodAttribute]:

        db_type = model.data_source.type
        plywood_attributes = PlywoodApi.convert_attributes(db_type, [a.to_json() for a in attributes])
        res = []

        for attribute in plywood_attributes:
            plywood_attribute = PlywoodAttribute(name=attribute['name'], type_=attribute['type'],
                                                 native_type=attribute['nativeType'],
                                                 is_supported=attribute['isSupported'])
            res.append(plywood_attribute)

        return res

    @staticmethod
    def find_attributes(_model, table_schema) -> List[Attribute]:
        columns =  table_schema['columns']
        if 'typed_columns' in table_schema and table_schema['typed_columns']:
            columns = table_schema['typed_columns']

        attributes = []
        for column in columns:
            name, kind = column["name"], column["type"]

            attributes.append(Attribute(name=name, kind=kind))
        return attributes

    @staticmethod
    def find_dimensions(attributes: List[PlywoodAttribute]):
        dimensions = []

        for attribute in attributes:
            if attribute.type_.upper() not in MEASURE_TYPES:
                dimensions.append(Dimension(name=attribute.name, kind=attribute.type_))
        return dimensions

    @classmethod
    def find_measures(cls, attributes: List[PlywoodAttribute]):
        measures = []
        for attribute in attributes:
            if attribute.type_.upper() in MEASURE_TYPES:
                measures.append(Measure(name=attribute.name, kind=attribute.type_))
        return measures
