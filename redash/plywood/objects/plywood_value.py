from typing import Optional, List, Dict

SPLIT = 'SPLIT'
KEYS = 'keys'


class Attribute:
    def __init__(self, name: str, type: str):
        self.__name = name
        self.__type = type

    def dict(self) -> dict:
        return dict(name=self.__name, type=self.__type)

    @property
    def name(self):
        return self.__name

    @property
    def type(self):
        return self.__type

    def __str__(self):
        return f'<Attribute [Name: {self.name}. Type: {self.type}]>'

    @staticmethod
    def from_array(data: List[Dict]) -> List['Attribute']:
        return [Attribute(name=v['name'], type=v["type"]) for v in data]


class DataEntry:
    def __init__(self, split: Optional['PlywoodValue'] = None, extra: dict = None):
        self.__split = split
        self.__extra = extra

    @property
    def split(self) -> Optional['PlywoodValue']:
        return self.__split

    @property
    def extra(self) -> Optional[dict]:
        return self.__extra

    def dict(self):
        obj = dict()

        if self.split:
            obj[SPLIT] = self.split.dict()

        if self.extra:
            obj.update(self.extra)

        return obj

    def __str__(self):
        return f'<DataEntry [Split: {self.split}. Extra: {self.extra}]>'


class PlywoodValue:

    def __init__(self,
                 keys: Optional[List[str]] = None,
                 attributes: Optional[List[Attribute]] = None,
                 data: Optional[List[DataEntry]] = None,
                 ):
        self.__keys = keys
        self.__attributes = attributes
        self.__data = data

    @property
    def keys(self) -> Optional[List[str]]:
        return self.__keys

    @property
    def attributes(self) -> Optional[List[Attribute]]:
        return self.__attributes

    @property
    def data(self) -> Optional[List[DataEntry]]:
        return self.__data

    def dict(self):
        res = dict()

        if self.keys:
            res[KEYS] = [*self.keys]

        if self.attributes:
            res['attributes'] = [v.dict() for v in self.attributes]

        if self.data:
            res['data'] = [v.dict() for v in self.data]

        return res

    @staticmethod
    def from_array(data_input: List[Dict]) -> List['PlywoodValue']:
        data_entry_list = []

        for item in data_input["data"]:
            split_value = None

            if SPLIT in item:
                split_value = PlywoodValue.from_json(item[SPLIT])

            extra = {**item}
            if SPLIT in extra:
                extra.pop(SPLIT)

            data_entry = DataEntry(
                split=split_value,
                extra=extra,
            )
            data_entry_list.append(data_entry)

        return data_entry_list

    @staticmethod
    def from_json(data_input: dict) -> 'PlywoodValue':

        attributes = Attribute.from_array(data_input["attributes"]) if 'attributes' in data_input else None

        data_entry_list = PlywoodValue.from_array(data_input) if 'data' in data_input else None

        keys = data_input[KEYS] if KEYS in data_input else None

        return PlywoodValue(
            keys=keys,
            attributes=attributes,
            data=data_entry_list,
        )

    def __str__(self):
        return f'<PlywoodValue [Keys {self.keys}. Attributes {self.attributes}. DataEntry {self.data}]>'
