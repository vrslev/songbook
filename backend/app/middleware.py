import secure
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.types import ASGIApp


class SecureHeadersMiddleware(BaseHTTPMiddleware):
    headers: secure.Secure

    def __init__(self, app: ASGIApp, headers: secure.Secure) -> None:
        super().__init__(app)
        self.headers = headers

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        response = await call_next(request)
        self.headers.framework.fastapi(response)
        return response
