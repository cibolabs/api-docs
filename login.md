# Login API

See the [Quick start](quickstart.md) for more information.

This document provides linux bash commands to demonstrate how to: 
- Use the credentials we supply you to get an access token

We assume: 
- Linux terminal 
- The jq and curl programs are installed 

You only need to get an access token once every 24 hours.
Use the access token for all subsequent requests within 24 hours.
When the access token expires, the APIs respond with a message indicating such.
For example:

```json
{"message":"The incoming token has expired"}
```

Use this as a trigger to request a new access token.

Below is an example of obtaining an access token for calling the Cibolabs API.

The example assumes you’ve set two environment variables,
CIBO_CLIENT_ID and CIBO_CLIENT_SECRET, in your shell session. 

```bash 
# Create a base64 encoded version of your client ID and secret 

CREDENTIALS=$(printf "%s:%s" "$CIBO_CLIENT_ID" "$CIBO_CLIENT_SECRET" | base64 -w 0)

# Exchange your credentials for an access token  

TOKEN=$(curl -s -X POST \ 
    -H "Content-Type: application/x-www-form-urlencoded" \ 
    -H "Authorization: Basic ${CREDENTIALS}" \ 
    -d "grant_type=client_credentials" \ 
    "https://login.cibolabs.com/oauth2/token" \
    | jq -r '.access_token') 

``` 

If successful, the `TOKEN` variable holds the access token.

# Security Considerations

Do not allow your CIBO_CLIENT_ID and CIBO_CLIENT_SECRET values to be accessible on the public internet.
Once these leak attackers will be able to use these values to make calls to the Cibolabs
API at your expense. You will be liable for charges related to API calls by anyone with these values.

In particular:
- Do not place these within Javascript or HTML or any other file transmitted to the user's browser. Users
will be able to retrieve these values by viewing the source code of your site. This access token should
only be obtained by your server and then transmitted to the browser. Since an access token expires the 
likelihood of unauthorised access is low.
- Keep the values of CIBO_CLIENT_ID and CIBO_CLIENT_SECRET private to your server
- If keeping the values of CIBO_CLIENT_ID and CIBO_CLIENT_SECRET in a source control file please
ensure that your source control is private and access is only possible by authorised people. MFA
should be enabled on your source control as an extra level of security


