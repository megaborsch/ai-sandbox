SHELL := /bin/bash
SCRIPTS := ./scripts

.PHONY: start-all stop-all restart-all
.PHONY: start-backend stop-backend restart-backend
.PHONY: start-frontend stop-frontend restart-frontend

start-all:
	@bash $(SCRIPTS)/start-all.sh

stop-all:
	@bash $(SCRIPTS)/stop-all.sh

restart-all:
	@bash $(SCRIPTS)/restart-all.sh

start-backend:
	@bash $(SCRIPTS)/start-backend.sh

stop-backend:
	@bash $(SCRIPTS)/stop-backend.sh

restart-backend:
	@bash $(SCRIPTS)/restart-backend.sh

start-frontend:
	@bash $(SCRIPTS)/start-frontend.sh

stop-frontend:
	@bash $(SCRIPTS)/stop-frontend.sh

restart-frontend:
	@bash $(SCRIPTS)/restart-frontend.sh
