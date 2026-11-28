# Quality project

## Run the application and quality measurements

Prerequisite: Docker with the Compose plugin. From the repository root run:

```sh
docker compose --profile measure run --build --rm analyse
```

Compose builds and starts MongoDB, the backend, and frontend, waits until they are healthy, then runs the analyzer against those live containers. It writes the JSON result to [`docs/mesures/v0/measurements.json`](docs/mesures/v0/measurements.json).

Open the frontend at <http://localhost:8080>. The stack remains running after the analyzer exits. Stop the containers with:

```sh
docker compose down
```

The database data stays in a named Docker volume. To remove it too, run `docker compose down -v`.

No `.env` file is needed for local use. Copy `.env.example` to `.env` to customize the port and local development credentials. These defaults are for local measurement runs.

See [`measurement/AGENTS.md`](measurement/AGENTS.md) for the measurement list, report format, limits, and the rules for adding a new measurement safely.
