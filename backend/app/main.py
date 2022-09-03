from backend.app.factory import Settings, get_app, make_state_from_settings

settings = Settings(".env")  # pyright: ignore[reportGeneralTypeIssues]
state = make_state_from_settings(settings=settings)
app = get_app(state=state, debug=settings.debug, sentry_dsn=settings.sentry_dsn)
