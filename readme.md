# Ricardian Contract React Component

This is react dependency used for rendering ricardian contracts inside react application. 

The dependency allows you to use any component framework and render the ricardian contract directly into your application1

You can find the example here: https://github.com/Ricardian-Fabric/Ricardian-Contract-React-Component-EXAMPLE

The Ricardian contract exposes the following interface:

        <RicardianContract
            LoadingIndicator={<ProgressIndicator />}
            arweaveTx='ARWEAVE_TRANSACTION_ID'
            AcceptButton={<button>Accept</button>}
            signingSuccessCallback={() => { 
                // Do something when contract is accepted 
            }}
            signingErrorCallback={(msg) => {
                // Handle errors, the msg contains the eror message
            }}
            provider={PROVIDER}
            useReverseGeocoding={true}
        ></RicardianContract>


## Interface

    export interface RicardianContractProps {
        arweaveTx: string,
        provider: provider,
        LoadingIndicator: React.ReactNode,
        useReverseGeocoding: boolean,
        AcceptButton: React.ReactNode,
        signingSuccessCallback: SigningSuccessCallback,
        signingErrorCallback: SigningErrorCallback,

    }

### LoadingIndicator

You can pass in any JSX element to render as loading indicator while the contract is loading

### arweaveTx

The transaction ID of the Arweave transaction containing the Ricardian Contract. You can get this from Ricardian Fabric

### AcceptButton

Pass in any button element to render. The Ricardian Contract component will overlay this button element and listen for click events on the overlay so any component will do.

### signingSuccessCallback

Pass in any function to call when a contract has been accepted

### signingErrorCallback

Pass a callback to this prop, It will be called when errors occur

### provider

The Provider is a valid web3 provider from web3-core.
For example you can use window.ethereum. The component uses this provider to initialize web3.js internally.

### useReverseGeocoding

The built in decentralized reverse geocoder is useful for blocking countries from signing the app, but only client side.
You can determine the location of a browser from the coordinates from the geolocaiton API.

# Example

You can find the working example here:

# Development

When developing you can link this dependency using npm link to an external application created with create-react-app.

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