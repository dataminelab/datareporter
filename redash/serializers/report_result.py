import io
import csv
import xlsxwriter
from funcy import rpartial, project
from dateutil.parser import isoparse as parse_date
from redash.utils import json_loads, UnicodeWriter
from redash.query_runner import TYPE_BOOLEAN, TYPE_DATE, TYPE_DATETIME
from .query_result import _get_column_lists
from redash.authentication.org_resolving import current_org


def serialize_query_result_to_xlsx_with_multiple_sheets(query_results):
    output = io.BytesIO()
    book = xlsxwriter.Workbook(output, {"constant_memory": True})

    for query_result in query_results:
        query_data = query_result.data
        sheet = book.add_worksheet(f"result({query_result.id})")

        column_names = []
        for c, col in enumerate(query_data["columns"]):
            sheet.write(0, c, col["name"])
            column_names.append(col["name"])

        for r, row in enumerate(query_data["rows"]):
            for c, name in enumerate(column_names):
                v = row.get(name)
                if isinstance(v, (dict, list)):
                    v = str(v)
                sheet.write(r + 1, c, v)

    book.close()

    return output.getvalue()


def serialize_report_result_to_dsv(query_results, delimiter):
    # good enough but data is overlaping because of the first value is single row while second one has alot of rows
    s = io.StringIO()
    rows = []
    fieldnames = []

    for query_result in query_results:
        query_data = query_result.data

        extra_fieldnames, special_columns = _get_column_lists(query_data["columns"] or [])
        fieldnames = list(set(extra_fieldnames + fieldnames))

        for row in query_data["rows"]:
            for col_name, converter in special_columns.items():
                if col_name in row:
                    row[col_name] = converter(row[col_name])
            rows.append(row)

    writer = csv.DictWriter(s, extrasaction="ignore", fieldnames=fieldnames, delimiter=delimiter)
    writer.writeheader()
    for row in rows:
        writer.writerow(row)

    return s.getvalue()
