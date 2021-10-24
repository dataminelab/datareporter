import json
import unittest

from redash.plywood.parsers.query_parser_v2 import PlywoodQueryParserV2
from tests.plywood.fixtures.test_data_0_split_1_measure_1_filter.sample_1 import POSTGRES_0_SPLIT_JOBS, \
    POSTGRES_0_SPLIT_SHAPE, POSTGRES_0_SPLIT_RESULT
from tests.plywood.fixtures.test_data_0_split_1_measure_1_filter_timeshift.sample_1 import \
    POSTGRES_0_SPLIT_JOBS_TIMESHIFT, POSTGRES_0_SPLIT_SHAPE_TIMESHIFT, POSTGRES_0_SPLIT_RESULT_TIMESHIFT
from tests.plywood.fixtures.test_data_1_split_1_measure_1filter_timeshift.sample_1 import \
    POSTGRES_1_SPLIT_JOBS_TIMESHIFT, POSTGRES_1_SPLIT_SHAPE_TIMESHIFT, POSTGRES_1_SPLIT_RESULT_TIMESHIFT
from tests.plywood.fixtures.test_data_1_split_1_mesture_1_filter.sample_1 import POSTGRES_1_SLIT_JOBS, \
    TEST_DATA_1_SPLIT_SHAPE, POSTGRES_1_SPLIT_RESULT
from tests.plywood.fixtures.test_data_2_splits_1_measue_big_query import POSTGRES_2_SLIT_JOBS_BIG_QUERY, \
    TEST_DATA_2_SPLIT_SHAPE_BIG_QUERY, POSTGRES_2_SPLIT_RESULT_BIG_QUERY, POSTGRES_LINE_CHART_RESULT, \
    POSTGRES_LINE_CHART_SHAPE, POSTGRES_LINE_CHART_RESULT_TO_COMPARE
from tests.plywood.fixtures.test_data_2_splits_1_measure_1_filter import POSTGRES_2_SLIT_JOBS, TEST_DATA_2_SPLIT_SHAPE, \
    POSTGRES_2_SPLIT_RESULT

CUSTOMER_DATA_CUBE = 'customer'
CUSTOMER_DATA_CUBE_BIG_QUERY = 'public.wikiticker'

ENGINE = 'postgres'
ENGINE_BIG_QUERY = 'bigquery'


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

    def test_2_split_1_measure_1_filter(self):
        parser = PlywoodQueryParserV2(
            data_cube_name=CUSTOMER_DATA_CUBE,
            query_result=POSTGRES_2_SLIT_JOBS,
            shape=TEST_DATA_2_SPLIT_SHAPE,

        )

        data = parser.parse_ply(ENGINE)

        self.assertDictEqual(data, POSTGRES_2_SPLIT_RESULT)

    def test_2_split_1_measure_1_filter_big_query(self):
        parser = PlywoodQueryParserV2(
            data_cube_name=CUSTOMER_DATA_CUBE_BIG_QUERY,
            query_result=POSTGRES_2_SLIT_JOBS_BIG_QUERY,
            shape=TEST_DATA_2_SPLIT_SHAPE_BIG_QUERY,

        )

        data = parser.parse_ply(ENGINE_BIG_QUERY)
        self.assertDictEqual(data, POSTGRES_2_SPLIT_RESULT_BIG_QUERY)

    def test_chart_line(self):
        parser = PlywoodQueryParserV2(
            data_cube_name=CUSTOMER_DATA_CUBE_BIG_QUERY,
            query_result=POSTGRES_LINE_CHART_RESULT,
            shape=POSTGRES_LINE_CHART_SHAPE,
            visualization='line-chart'
        )
        data = parser.parse_ply(ENGINE_BIG_QUERY)
        self.assertDictEqual(data, POSTGRES_LINE_CHART_RESULT_TO_COMPARE)
