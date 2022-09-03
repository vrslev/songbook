.PHONY: backend backend-clean frontend
backend:
	.venv/bin/uvicorn scripts.testing_backend:app --reload
backend-clean:
	.venv/bin/uvicorn backend.app.main:app --reload
frontend:
	npm run dev
