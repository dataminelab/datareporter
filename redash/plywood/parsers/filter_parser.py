import copy

from redash.plywood.objects.data_cube import DataCube


class PlywoodFilterParser:
    def __init__(self, result: list, data_cube: DataCube, shape: dict):
        self.result = result[0]['query_result']  # we handle only one so far
        self.data_cube = data_cube
        self.shape = shape

    def get_plywood_value(self) -> dict:
        shape_copy = copy.deepcopy(self.shape)
        shape_copy['data'] = self.result['data']['rows']
        return shape_copy
