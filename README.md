# DiCoMe

## Run Code without API Call

``` npx tsc ``` or ``` npm run build ```

and then

``` node dist/src/api/testRunner.js ```

## Run Tests with ECMAScript Modules

from package.json command:
``` npm run test ```

from console:
``` NODE_OPTIONS="$NODE_OPTIONS --experimental-vm-modules" npx jest ```

## EXAMPLES

original
{
  "package": {
    "id": "scml",
    "classes": [
      {
        "id": "Smart City",
        "references": "haaalooo"
      }
    ]
  }
}

a
{
  "package": {
    "classes": [
      {
        "id": "SmartCity",
        "references": "hallo"
      }
    ]
  }
}

orginal
{
  "package": {
    "id": "scml",
    "classes": [
      {
        "id": "Smart City",
        "references": [],
        "a": "b"
      }
      ]
  }
}
