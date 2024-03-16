
```bash
=============================================================================== 760 passed, 137 warnings in 578.37s (0:09:38) ===============================================================================
```

below errors accured when I was testing query runners connections
```bash
'Traceback (most recent call last):\n  
File "/usr/local/lib/python3.7/site-packages/ptvsd/_vendored/pydevd/_pydevd_bundle/pydevd_resolver.py", 
line 214, in _get_py_dictionary\n    
attr = getattr(var, name)\n  
File "/app/redash/utils/configuration.py", 
line 39, in schema\n    
raise RuntimeError("Schema missing.")\n
RuntimeError: Schema missing.\n'

'Traceback (most recent call last):\n  
File "/usr/local/lib/python3.7/site-packages/ptvsd/_vendored/pydevd/_pydevd_bundle/pydevd_resolver.py", 
line 214, in _get_py_dictionary\n    
attr = getattr(var, name)\n  
File "/app/redash/query_runner/__init__.py", 
line 92, in host\n    
raise NotImplementedError()\n
NotImplementedError\n'
```
