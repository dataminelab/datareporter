
# I thought increasing python version form 3.7 to 3.8 would solve half of the warnings but alas it didn't.
================================================================================ 1 failed, 759 passed, 2418 warnings in 575.56s (0:09:35) ================================================================================

## worker server error
```bash
Traceback (most recent call last):
  File "/usr/local/lib/python3.8/site-packages/gunicorn/workers/sync.py", line 134, in handle
    self.handle_request(listener, req, client, addr)
  File "/usr/local/lib/python3.8/site-packages/gunicorn/workers/sync.py", line 175, in handle_request
    respiter = self.wsgi(environ, resp.start_response)
  File "/usr/local/lib/python3.8/site-packages/flask/app.py", line 2463, in __call__
    return self.wsgi_app(environ, start_response)
  File "/usr/local/lib/python3.8/site-packages/werkzeug/middleware/proxy_fix.py", line 232, in __call__
    return self.app(environ, start_response)
  File "/usr/local/lib/python3.8/site-packages/flask/app.py", line 2449, in wsgi_app
    response = self.handle_exception(e)
  File "/usr/local/lib/python3.8/site-packages/flask/app.py", line 1866, in handle_exception
    reraise(exc_type, exc_value, tb)
  File "/usr/local/lib/python3.8/site-packages/flask/_compat.py", line 39, in reraise
    raise value
  File "/usr/local/lib/python3.8/site-packages/flask/app.py", line 2446, in wsgi_app
    response = self.full_dispatch_request()
  File "/usr/local/lib/python3.8/site-packages/flask/app.py", line 1951, in full_dispatch_request
    rv = self.handle_user_exception(e)
  File "/usr/local/lib/python3.8/site-packages/flask/app.py", line 1820, in handle_user_exception
    reraise(exc_type, exc_value, tb)
  File "/usr/local/lib/python3.8/site-packages/flask/_compat.py", line 39, in reraise
    raise value
  File "/usr/local/lib/python3.8/site-packages/flask/app.py", line 1949, in full_dispatch_request
    rv = self.dispatch_request()
  File "/usr/local/lib/python3.8/site-packages/flask/app.py", line 1935, in dispatch_request
    return self.view_functions[rule.endpoint](**req.view_args)
  File "/app/redash/worker.py", line 147, in process
    job_consumer.execute()
  File "/app/redash/worker.py", line 74, in execute
    self.consume_first_available_job()
  File "/app/redash/worker.py", line 93, in consume_first_available_job
    self.execute_job(next_job, queue)
  File "/app/redash/tasks/worker.py", line 129, in execute_job
    super().execute_job(job, queue)
  File "/usr/local/lib/python3.8/site-packages/rq/worker.py", line 1273, in execute_job
    self.monitor_work_horse(job, queue)
TypeError: monitor_work_horse() takes 2 positional arguments but 3 were given
```

## worker server error 2
```bash
self = <tests.tasks.test_worker.TestWorkerMetrics testMethod=test_worker_records_success_metrics>, incr = <MagicMock name='incr' id='140079289943760'>

    def test_worker_records_success_metrics(self, incr):
        query = self.factory.create_query()
    
        with Connection(rq_redis_connection):
            enqueue_query(
                query.query_text,
                query.data_source,
                query.user_id,
                False,
                None,
                {"Username": "Patrick", "query_id": query.id},
            )
    
            Worker(["queries"]).work(max_jobs=1)
    
        calls = [
            call("rq.jobs.running.queries"),
            call("rq.jobs.started.queries"),
            call("rq.jobs.running.queries", -1, 1),
            call("rq.jobs.finished.queries")
        ]
>       incr.assert_has_calls(calls)

tests/tasks/test_worker.py:43: 
```