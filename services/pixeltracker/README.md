# Pixeltracker
A service that counts chart views and stores different chart view statistics in the database.

## Testing

### On local instance
To run the pixeltracker tests locally make sure your local DW instance is running.
Then execute
```shell
npm test
```

### On Docker
Ensure Docker is running.

Then execute:
```shell
make test
```

To teardown the test infrastructure run:
```shell
make test-teardown
```
