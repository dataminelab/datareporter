import unittest

from redash.plywood.query_parser import PlywoodQueryParserV1
from redash.plywood.query_parser_v2 import PlywoodQueryParserV2
from tests.plywood.fixtures.test_data_0_split_1_measure_1_filter.sample_1 import POSTGRES_0_SPLIT_JOBS, \
    POSTGRES_0_SPLIT_SHAPE, POSTGRES_0_SPLIT_RESULT
from tests.plywood.fixtures.test_data_0_split_1_measure_1_filter_timeshift.sample_1 import \
    POSTGRES_0_SPLIT_JOBS_TIMESHIFT, POSTGRES_0_SPLIT_SHAPE_TIMESHIFT, POSTGRES_0_SPLIT_RESULT_TIMESHIFT
from tests.plywood.fixtures.test_data_1_split_1_measure_1filter_timeshift.sample_1 import \
    POSTGRES_1_SPLIT_JOBS_TIMESHIFT, POSTGRES_1_SPLIT_SHAPE_TIMESHIFT, POSTGRES_1_SPLIT_RESULT_TIMESHIFT
from tests.plywood.fixtures.test_data_1_split_1_mesture_1_filter.sample_1 import POSTGRES_1_SLIT_JOBS, \
    TEST_DATA_1_SPLIT_SHAPE, POSTGRES_1_SPLIT_RESULT

CUSTOMER_DATA_CUBE = 'customer'
ENGINE = 'postgres'


class TestPostgresParse(unittest.TestCase):

    def test_0_split_1_measure_1_filter(self):
        parser = PlywoodQueryParserV1(
            data_cube_name=CUSTOMER_DATA_CUBE,
            query_result=POSTGRES_0_SPLIT_JOBS,
            shape=POSTGRES_0_SPLIT_SHAPE,

        )

        data = parser.parse_ply(ENGINE)

        self.assertDictEqual(data, POSTGRES_0_SPLIT_RESULT)

    def test_1_split_1_measure_1_filter(self):
        parser = PlywoodQueryParserV1(
            data_cube_name=CUSTOMER_DATA_CUBE,
            query_result=POSTGRES_1_SLIT_JOBS,
            shape=TEST_DATA_1_SPLIT_SHAPE,

        )

        data = parser.parse_ply(ENGINE)

        self.assertDictEqual(data, POSTGRES_1_SPLIT_RESULT)

    def test_0_split_1_measure_1_filter_time_shift(self):
        parser = PlywoodQueryParserV1(
            data_cube_name=CUSTOMER_DATA_CUBE,
            query_result=POSTGRES_0_SPLIT_JOBS_TIMESHIFT,
            shape=POSTGRES_0_SPLIT_SHAPE_TIMESHIFT,

        )

        data = parser.parse_ply(ENGINE)

        self.assertDictEqual(data, POSTGRES_0_SPLIT_RESULT_TIMESHIFT)

    def test_1_split_1_measure_1filter_time_shift(self):
        parser = PlywoodQueryParserV1(
            data_cube_name=CUSTOMER_DATA_CUBE,
            query_result=POSTGRES_1_SPLIT_JOBS_TIMESHIFT,
            shape=POSTGRES_1_SPLIT_SHAPE_TIMESHIFT,

        )

        data = parser.parse_ply(ENGINE)

        self.assertDictEqual(data, POSTGRES_1_SPLIT_RESULT_TIMESHIFT)


class TestPostgresParseV2(unittest.TestCase):

    def test_0_split_1_measure_1_filter(self):
        parser = PlywoodQueryParserV2(
            data_cube_name=CUSTOMER_DATA_CUBE,
            query_result=POSTGRES_0_SPLIT_JOBS,
            shape=POSTGRES_0_SPLIT_SHAPE,

        )

        data = parser.parse_ply(ENGINE)

        self.assertDictEqual(data, POSTGRES_0_SPLIT_RESULT)

    def test_0_split_1_measure_1_filter_time_shift(self):
        parser = PlywoodQueryParserV2(
            data_cube_name=CUSTOMER_DATA_CUBE,
            query_result=POSTGRES_0_SPLIT_JOBS_TIMESHIFT,
            shape=POSTGRES_0_SPLIT_SHAPE_TIMESHIFT,
        )

        data = parser.parse_ply(ENGINE)

        self.assertDictEqual(data, POSTGRES_0_SPLIT_RESULT_TIMESHIFT)

    def test_1_split_1_measure_1_filter(self):
        parser = PlywoodQueryParserV2(
            data_cube_name=CUSTOMER_DATA_CUBE,
            query_result=POSTGRES_1_SLIT_JOBS,
            shape=TEST_DATA_1_SPLIT_SHAPE,

        )

        data = parser.parse_ply(ENGINE)
        self.assertDictEqual(data, POSTGRES_1_SPLIT_RESULT)

    def test_1_split_1_measure_1filter_time_shift(self):
        parser = PlywoodQueryParserV2(
            data_cube_name=CUSTOMER_DATA_CUBE,
            query_result=POSTGRES_1_SPLIT_JOBS_TIMESHIFT,
            shape=POSTGRES_1_SPLIT_SHAPE_TIMESHIFT,

        )

        data = parser.parse_ply(ENGINE)

        self.assertDictEqual(data, POSTGRES_1_SPLIT_RESULT_TIMESHIFT)
