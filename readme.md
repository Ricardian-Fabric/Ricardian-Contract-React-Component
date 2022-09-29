# Development

When developing you can link this dependency using npm link to an external application crated with create-react-app.

When making changes run `npm run build` to rebuild the dependency and it will refresh in the other react project too


You might run into this error: 


    Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:

        You might have mismatching versions of React and the renderer (such as React DOM)
        You might be breaking the Rules of Hooks
        You might have more than one copy of React in the same app See react-invalid-hook-call for tips about how to debug and

    fix this problem

I was able to fix this by making my app and library point to the same react (package) location.

Below are the steps I followed :
1. In Your Application:
a) cd node_modules/react && npm link
b) cd node_modules/react-dom && npm link

2. In Your Library
a) npm link react
b) npm link react-dom

3)Stop your dev-server and do `npm start` again.

This Error Does not appear when importing the dependency from NPM.