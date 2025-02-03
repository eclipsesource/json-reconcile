# json-reconcile [![Project - Active Development](https://img.shields.io/badge/Project-Active-2ea44f)](https://github.com/eclipsesource/.github/blob/main/repository-classification.md) [![Aim - PoC](https://img.shields.io/badge/Aim-PoC-a45b2e)](https://github.com/eclipsesource/.github/blob/main/repository-classification.md)
Typescript library for diffing and merging JSON models


## Purpose
- easy-to-use conflict management
- comparison and merging functionality in a general way
- platform-independent REST API that can handle model conflicts in JSON format
- 2-way and 3-way merge supported
- state of the merging progress is saved and handled with session cookies

## Examples
### update update conflict
**Request**
```
POST /dicome/compare
Content-Type: application/json

{
  "original": {
    "package": {
      "id": "scml",
      "classes": [
        {
          "id": "xyz",
          "name": "Smart City"
        }
      ]
    }
  },
  "left": {
    "package": {
      "id": "scml",
      "classes": [
        {
          "id": "xyz",
          "name": "SmartCity"
        }
      ]
    }
  },
  "right": {
    "package": {
      "id": "scml",
      "classes": [
        {
          "id": "xyz",
          "name": "Smart_City"
        }
      ]
    }
  }
}
```

## Usage

### API Description

```
POST /dicome/compare
```
initial endpoint, if request header not set then new session is created (set cookie header for all following requests)

**Request Header:** optional current session - session cookie

**Request Body:** model left, model right (and original)

**Response:** diffmodel

```
GET /dicome/model/left
```
**Request Header:** current session - session cookie

**Request Body:** -

**Response:** left model

```
GET /dicome/model/right
```
**Request Header:** current session - session cookie

**Request Body:** -

**Response:** right model

```
GET /dicome/model/diff
```
**Request Header:** current session - session cookie

**Request Body:** -

**Response:** diff model

```
PUT /dicome/apply/[ltr | rtl]
```
**Request Header:** current session - session cookie

**Parameter:** ltr (left to right) or rtl (right to left)

**Request Body:** list of 1-n changes to apply

**Response:** JSON patch (if technically possible) of diff model and left/right

```
PUT /dicome/accept
```
for conflicts, if this is a left change then right automatically rejected and vis a versa

**Request Header:** current session - session cookie

**Request Body:** list of 1-n changes to apply

**Response:** JSON patch (if technically possible) of diff model and left/right

```
PUT /dicome/reject
```
for conflicts, if this is a left change then right automatically acctepted and vis a versa

**Request Header:** current session - session cookie

**Request Body:** list of 1-n changes to reject

**Response:** JSON patch (if technically possible) of diff model and left/right

```
DELETE /dicome/session
```
triggers cleanup (remove models)

**Request Header:** current session - session cookie

**Request Body:** -

**Response:** 200 OK
