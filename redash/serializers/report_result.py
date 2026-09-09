import csv
import io

import xlsxwriter

from .query_result import _get_column_lists


def serialize_query_result_to_xlsx_with_multiple_sheets(query_results):
    output = io.BytesIO()
    book = xlsxwriter.Workbook(output, {"constant_memory": True})

    merged_rows = []
    fieldnames = []

    # First, collect all fieldnames (columns) from all results
    for query_result in query_results:
        query_data = query_result.data
        for col in query_data.get("c~olumns", []):
            if col["name"] not in fieldnames:
                fieldnames.append(col["name"])

    # Now, merge rows that can be merged (identity based on common columns)
    for query_result in query_results:
        query_data = query_result.data
        for row in query_data.get("rows", []):
            found = False
            for existing_row in merged_rows:
                common_keys = set(row.keys()) & set(existing_row.keys())
                if common_keys and all(row[k] == existing_row[k] for k in common_keys):
                    existing_row.update(row)
                    found = True
                    break
            if not found:
                merged_rows.append(dict(row))

    # Single sheet for all merged data
    sheet = book.add_worksheet("Merged Result")

    # Write header
    for c, name in enumerate(fieldnames):
        sheet.write(0, c, name)

    # Write data
    for r, row in enumerate(merged_rows):
        for c, name in enumerate(fieldnames):
            v = row.get(name)
            if isinstance(v, (dict, list)):
                v = str(v)
            sheet.write(r + 1, c, v)

    book.close()

    return output.getvalue()


def serialize_report_result_to_dsv(query_results, delimiter):
    # good enough but data is overlaping because of the first value is single row while second one has alot of rows
    s = io.StringIO()
    merged_rows = []
    fieldnames = []

    # First, collect all fieldnames
    for query_result in query_results:
        query_data = query_result.data
        extra_fieldnames, _ = _get_column_lists(query_data.get("columns") or [])
        for name in extra_fieldnames:
            if name not in fieldnames:
                fieldnames.append(name)

    # Now, merge rows that can be merged (identity based on common columns)
    for query_result in query_results:
        query_data = query_result.data
        _, special_columns = _get_column_lists(query_data.get("columns") or [])

        for row in query_data.get("rows", []):
            # Apply converters
            processed_row = dict(row)
            for col_name, converter in special_columns.items():
                if col_name in processed_row:
                    processed_row[col_name] = converter(processed_row[col_name])

            # Try to find a matching row in merged_rows
            found = False
            for existing_row in merged_rows:
                # Two rows are "mergeable" if they have the same values for all their common keys
                common_keys = set(processed_row.keys()) & set(existing_row.keys())
                if not common_keys:
                    continue

                if all(processed_row[k] == existing_row[k] for k in common_keys):
                    # Merge them
                    existing_row.update(processed_row)
                    found = True
                    break

            if not found:
                merged_rows.append(processed_row)

    writer = csv.DictWriter(s, extrasaction="ignore", fieldnames=fieldnames, delimiter=delimiter)
    writer.writeheader()
    for row in merged_rows:
        writer.writerow(row)

    return s.getvalue()
