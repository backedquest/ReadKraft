ReadKraft
This is an online book buying and reading platform.

To run the stripe platform do in cmd 
setup webhook to backend:
1)stripe login
2)stripe listen --forward-to localhost:8080/api/user/webhook
3)paste the webhook secret key to dotenv
get secret key from stripe :
paste it in dotenv
make the stripe controller to buy : createSession , get webhook , verify payment