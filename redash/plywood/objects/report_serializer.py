from typing import List, Optional, Union

from redash.plywood.objects.plywood_value import PlywoodValue


class ReportMetaData:
    def __init__(self, price: float = 0, proceed_data: int = 0):
        self.price = price
        self.proceed_data = proceed_data

    @property
    def has_data(self):
        return self.price != 0 or self.proceed_data != 0

    def to_dict(self):
        return {
            'price': self.price,
            'proceed_data': self.proceed_data,
        }


class Progress:
    def __init__(self, jobs: int, results: int):
        self.jobs = jobs
        self.results = results

    def dict(self):
        total = self.jobs + self.results or 1
        return {
            'all': self.jobs + self.results,
            'results': self.results,
            'progress': int(self.results / total * 100),
        }


class ReportSerializer:

    def __init__(
        self,
        queries: List[dict],
        failed: Optional[List[str]] = None,
        shape: Optional[dict] = None,
        status: int = 200,
        data: Optional[Union[PlywoodValue, dict]] = None,
        meta: Optional[ReportMetaData] = None,
        expression_queries: Optional[List[dict]] = None,
    ):
        self.queries = queries
        self.failed = failed
        self.shape = shape
        self.status = status
        self.data = data
        self.meta = meta
        self.expression_queries = expression_queries

    def _get_progress(self) -> Progress:
        jobs = 0
        query_result = 0

        for query in self.queries:
            if 'job' in query:
                jobs += 1
            else:
                query_result += 1

        return Progress(jobs=jobs, results=query_result)

    def serialized(self) -> dict:
        data = None

        if self.data:
            if isinstance(self.data, dict):
                data = self.data
            else:
                data = self.data.dict()

        progress = self._get_progress()
        return {
            'data': data,
            'status': self.status,
            'queries': self.queries,
            'failed': self.failed,
            'meta': self.meta.to_dict() if self.meta else None,
            'shape': self.shape,
            'progress': progress.dict(),
            "expression_queries": self.expression_queries,
        }
