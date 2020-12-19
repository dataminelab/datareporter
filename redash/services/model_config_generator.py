import yaml
from inflection import titleize

from redash.models.models import Model
from redash.settings import IGNORED_DATA_SOURCE_TYPES, DATA_SOURCE_TYPE_MAPPINGS

INDENT_LEVELS = [3, 4]

BOOLEAN = "boolean"
NUMBER = "number"
TIME = "time"

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


class Attribute(BaseConfig):
    def __init__(self, name, kind):
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
        if self.kind in DIMENSION_KINDS:
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
    def __init__(self, name, attributes, dimensions, measures):
        self.name = name
        self.attributes = attributes
        self.dimensions = dimensions
        self.measures = measures

    def to_json(self):
        return self._build()

    def _build(self):
        data_cube_config = {
            "name": self.name,
            "title": titleize(self.name),
            "timeAttribute": self._find_time_attribute(),
            "clusterName": "native",
            "defaultSortMeasure": self._find_default_sort_measure(),
            "defaultSelectedMeasures": self._find_default_selected_measures(),
            "attributes": [attribute.to_json() for attribute in self.attributes],
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
            if attribute.kind in TIME_ATTRIBUTE_TYPES:
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
    def _build(model, refresh):
        schemas = model.data_source.get_schema(refresh=refresh)
        table_schema = next((schema for schema in schemas if schema["name"] == model.table), None)
        if table_schema is None:
            raise ValueError("Data source {} doesn't contain {} table".format(model.data_source, model.table))

        attributes = ModelConfigGenerator.find_attributes(model, table_schema)
        dimensions = ModelConfigGenerator.find_dimensions(attributes)
        measures = ModelConfigGenerator.find_measures(attributes)

        return ModelConfigAttributes(name=model.table, attributes=attributes, dimensions=dimensions, measures=measures)

    @staticmethod
    def find_attributes(model, table_schema) -> list:
        data_source_ignored_types = map(str.lower, set(IGNORED_DATA_SOURCE_TYPES.get(model.data_source.type, [])))
        type_mappings = {}
        for key in DATA_SOURCE_TYPE_MAPPINGS:
            type_mappings[key.lower()] = DATA_SOURCE_TYPE_MAPPINGS[key].lower()

        attributes = []
        for column in table_schema["columns"]:
            name, kind = column["name"], column["type"].lower()
            if kind not in data_source_ignored_types:
                normalized_kind = type_mappings[kind] if kind in type_mappings else kind
                attributes.append(Attribute(name=name, kind=normalized_kind))
        return attributes

    @staticmethod
    def find_dimensions(attributes):
        dimensions = []
        for attribute in attributes:
            if attribute.kind not in MEASURE_TYPES:
                dimensions.append(Dimension(name=attribute.name, kind=attribute.kind))
        return dimensions

    @classmethod
    def find_measures(cls, attributes):
        measures = []
        for attribute in attributes:
            if attribute.kind in MEASURE_TYPES:
                measures.append(Measure(name=attribute.name, kind=attribute.kind))
        return measures
