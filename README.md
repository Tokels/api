# api

## POST

### AUTHENTICATE USER

http://localhost:8081/api/users/authenticate
req.body: { email, password }
res: { token }

### CREATE USER

http://localhost:8081/api/users
req.body: { email, password }
res: { token }

## GET

### READ USER

http://localhost:8081/api/users/\_id
req.params: { \_id }
res: { id, email }

## PATCH

### UPDATE USER

http://localhost:8081/api/users/\_id
req.params: { \_id }
res: { id, email }

## DELETE

### DELETE USER

http://localhost:8081/api/users/\_id
req.params: { \_id }
res: { msg }
