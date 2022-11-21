# Makefile for backend

.PHONY: clean install start check-types

clean:
	rm -rf `find . -name __pycache__`
	rm -rf .pytest_cache
	rm -rf .venv

install:
	make clean
	python3.9 -m venv .venv
	.venv/bin/pip install -e .[dev]

test:
	.venv/bin/pytest --color=yes --cov

start:
	.venv/bin/uvicorn scripts.testing_backend:app --reload

check-types:
	.venv/bin/pyright
