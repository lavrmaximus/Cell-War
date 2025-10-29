# backend:
все хорошо

# frontend:
App.tsx:122 Uncaught ReferenceError: Cannot access 'handleAction' before initialization
    at Game (App.tsx:122:1)
    at renderWithHooks (react-dom.development.js:15486:1)
    at mountIndeterminateComponent (react-dom.development.js:20103:1)
    at beginWork (react-dom.development.js:21626:1)
    at HTMLUnknownElement.callCallback (react-dom.development.js:4164:1)
    at Object.invokeGuardedCallbackDev (react-dom.development.js:4213:1)
    at invokeGuardedCallback (react-dom.development.js:4277:1)
    at beginWork$1 (react-dom.development.js:27490:1)
    at performUnitOfWork (react-dom.development.js:26596:1)
    at workLoopSync (react-dom.development.js:26505:1)
react-dom.development.js:18704 The above error occurred in the <Game> component:

    at Game (http://192.168.2.117:3000/static/js/bundle.js:44711:84)
    at RenderedRoute (http://192.168.2.117:3000/static/js/bundle.js:36418:5)
    at Routes (http://192.168.2.117:3000/static/js/bundle.js:37152:5)
    at div
    at App
    at Router (http://192.168.2.117:3000/static/js/bundle.js:37086:15)
    at BrowserRouter (http://192.168.2.117:3000/static/js/bundle.js:34987:5)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
logCapturedError @ react-dom.development.js:18704
react-dom.development.js:26962 Uncaught ReferenceError: Cannot access 'handleAction' before initialization
    at Game (App.tsx:122:1)