# GP API

This API is meant to allow the JS/HTML world to get into the GP world.

The way to call an API endpoint from JS is:

```
GP.apiCall(endpointSelector, [...params], callback);
```

Where `endpointSelector` is one of the entries listed in the following section,
`params` is an array of parameters to pass to the API endpoint, and `callback`
is a JS function that optionally gets a parameter from the GP world.

Read on to see what endpoints exist and how to work with their return params.

## API endpoints

### Create a new MicroBlocks project

- **selector:** newProject
- **params:** none
- **returns:** nothing

Asks the IDE to create a new MicroBlocks project. Will pop up a confirmation
dialog prompt if a non-empty project is currently loaded.

### Open the MicroBlocks project dialog

- **selector:** openProjectDialog
- **params:** none
- **returns:** nothing

Asks the IDE to pop up the open project dialog window.
