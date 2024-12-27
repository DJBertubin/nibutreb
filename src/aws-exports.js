import Amplify from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: 'YOUR_AWS_REGION',
    userPoolId: 'YOUR_USER_POOL_ID',
    userPoolWebClientId: 'YOUR_APP_CLIENT_ID',
  },
});
