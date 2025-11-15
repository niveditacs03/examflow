import Parse from 'parse';

const appId = process.env.NEXT_PUBLIC_BACK4APP_APP_ID;
const jsKey = process.env.NEXT_PUBLIC_BACK4APP_JS_KEY;

if (!appId || !jsKey) {
  throw new Error('Missing Back4App environment variables');
}

// Initialize Parse
Parse.initialize(appId, jsKey);
Parse.serverURL = 'https://parseapi.back4app.com/';

export default Parse;