# Auth API Postman Examples

Base URL:

```text
http://localhost:5000/api/auth
```

## Register

Method: `POST`

URL:

```text
{{base_url}}/register
```

Headers:

```text
Content-Type: application/json
```

Body:

```json
{
  "full_name": "Priyanshu Sharma",
  "email": "priyanshu@example.com",
  "password": "password123",
  "role": "student"
}
```

Allowed roles:

```text
student, recruiter, admin
```

## Login

Method: `POST`

URL:

```text
{{base_url}}/login
```

Headers:

```text
Content-Type: application/json
```

Body:

```json
{
  "email": "priyanshu@example.com",
  "password": "password123"
}
```

## Protected Profile Route

Method: `GET`

URL:

```text
{{base_url}}/profile
```

Headers:

```text
Authorization: Bearer <your_jwt_token>
```

## Admin Protected Test Route

Method: `GET`

URL:

```text
{{base_url}}/admin-test
```

Headers:

```text
Authorization: Bearer <admin_jwt_token>
```
