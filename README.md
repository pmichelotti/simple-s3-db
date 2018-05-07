# Simple S3 DB

A simple key value pair API which stores values within S3.

## Usage

```
npm install simple-s3-db
```

```javascript
const SimpleS3DB = require( 'simple-s3-db' );
const AWS = require( 'aws-sdk' );

const db = new SimpleS3DB( new AWS.S3(), 'my-bucket-name' );
```

### `put( key, object, [options] )` 

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
        // Do something here
    } );
```

#### Valid Options

* `bucket`: If set this overrides the bucket set in the constructor

Any other options are passed as is to the S3 `putObject` operation.

### `get( key[, bucketOverride ] )`

```javascript
db.get( 'object-key' )
    .then( result => { 
        // Do something here 
    } );
```

When set, `bucketOverride` will override the `bucket` set in the constructor.

#### Result Object

* data: `object` what was put in the first place

### `delete( key[, bucketOverride ] )`

```javascript
db.delete( 'object-key' )
    .then( result => {
        // Do something here
    } );
```

When set, `bucketOverride` will override the `bucket` set in the constructor.

#### Deleting Multiple Objects

You can delete multiple objects at once by passing an array of 
keys.  This is particularly useful in conjunction with the list 
operation below.

```javascript
db.list( 'object-folder' ) 
    .then( result => {
        return db.delete( result.data );
    } )
    .then( result => {
        // Do something here
    } );
```

### List

```javascript
db.list( 'object-folder' )
    .then( result => { 
        // Do something here 
    } );
```

#### Result Object

* data: `array<string>` array of object keys contained in the folder 

#### Getting All the Things in a Folder

The general pattern for getting all the objects in a folder is 
to list the folder and then map the list to the objects.

```javascript
db.list( 'object-folder' )
    .then( result => {
        return Promise.all( 
                result.data.map( currentKey => db.get( currentKey ) ) 
            );
    } )
    .then( objects => {
        // Do Something here
    } );
``` 
