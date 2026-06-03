import contextvars

request_token = contextvars.ContextVar('request_token', default=None)
