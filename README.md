# Simple S3 DB

A simple key value pair API which stores values within S3.

## Usage

```
const SimpleS3DB = require( 'simple-s3-db' );
const AWS = require( 'aws-sdk' );

const db = new SimpleS3DB( new AWS.S3(), 'my-bucket-name' );
```

### Put 

```javascript
db.put( 'object-key', {
    id: "1",
    name: "Some name"
} )
    .then( result => { 
        // Do something here, or don't, whatever ... 
    } );
```

#### Putting Objects in a Folder

To place an object in a folder simply delimit the folder with 
`/` in your object key.

```javascript
db.put( 'object-folder/object-key', {
    id: "1",
    name: "Some name"
} )
    .then( result => { 
        // Do something here, or don't, whatever ... 
    } );
```

### Get

```javascript
db.get( 'object-key' )
    .then( result => { 
        // Do something here 
    } );
```

#### Result Object

* data: `object` what was put in the first place

### List

```javascript
db.list( 'object-folder' )
    .then( result => { 
        // Do something here 
    } );
```

#### Result Object

* data: `array<string>` array of object keys contained in the folder 


