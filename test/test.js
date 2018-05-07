const should = require( 'should' );
const sinon = require( 'sinon' );
require( 'should-sinon' );

const mockS3Factory = require( './mocks/mockS3' );
const SimpleS3DB = require( '../index' );

describe( 'Simple S3 DB', () => {

    let s3;
    let erroringS3;
    let db;
    let erroringDB;
    let dbWithoutBucket;

    beforeEach( function() {
        s3 = mockS3Factory();
        erroringS3 = mockS3Factory( true );

        db = new SimpleS3DB( s3, 'bucket' );
        erroringDB = new SimpleS3DB( erroringS3, 'bucket' );
        dbWithoutBucket = new SimpleS3DB( s3 );
    } );

    describe( 'Put', () => {

        it( 'Should put valid records', () => {

            return db.put( 'key', { a: 1 } )
                .then( result => {
                    result.should.match( { a: 1 } );
                    s3.putObject.should.be.calledOnce();
                    s3.putObject.should.be.calledWithMatch( {
                        Bucket: "bucket",
                        Key: "key",
                        Body: JSON.stringify( { a: 1 } )
                    } );
                } );

        } );

        it( 'Should accept string based records', () => {

            return db.put( 'key', 'value' )
                .then( result => {
                    result.should.match( 'value' );
                    s3.putObject.should.be.calledOnce();
                    s3.putObject.should.be.calledWithMatch( {
                        Bucket: "bucket",
                        Key: "key",
                        Body: "value"
                    } );
                } );

        } );

        it( 'Should allow for bucket override', () => {

            return db.put( 'key', 'value', { bucket: "overrideBucket"} )
                .then( result => {
                    result.should.match( 'value' );
                    s3.putObject.should.be.calledOnce();
                    s3.putObject.should.be.calledWithMatch( {
                        Bucket: "overrideBucket",
                        Key: "key",
                        Body: "value"
                    } );
                } );

        } );

        it( 'Should allow for additional options', () => {

            return db.put( 'key', 'value', { Option: "option"} )
                .then( result => {
                    result.should.match( 'value' );
                    s3.putObject.should.be.calledOnce();
                    s3.putObject.should.be.calledWithMatch( {
                        Bucket: "bucket",
                        Key: "key",
                        Body: "value",
                        Option: "option"
                    } );
                } );

        } );

        it( 'Should allow for objects to be put without a bucket configured at construction', () => {

            return dbWithoutBucket.put( 'key', 'value', { bucket: "overrideBucket"} )
                .then( result => {
                    result.should.match( 'value' );
                    s3.putObject.should.be.calledOnce();
                    s3.putObject.should.be.calledWithMatch( {
                        Bucket: "overrideBucket",
                        Key: "key",
                        Body: "value"
                    } );
                } );

        } );

        it( 'Should fail if no bucket is provided for the request', () => {

            return dbWithoutBucket.put( 'key', 'value' )
                .should.be.rejected();

        } );

    } );

    describe( 'Get', () => {

        it( 'Should resolve requests for known keys', () => {

            return db.get( 'knownJSONKey' )
                .then( result => {
                    result.should.match( {
                        data: { a: 1 }
                    } );
                } );

        } );

        it( 'Should resolve requests for string values', () => {

            return db.get( 'knownStringKey' )
                .then( result => {
                    result.should.match( {
                        data: "string value"
                    } );
                } );

        } );

        it( 'Should allow overriding of the bucket', () => {

            return db.get( 'knownStringKey', 'bucketOverride' )
                .then( result => {
                    result.should.match( {
                        data: "string value"
                    } );

                    s3.getObject.should.be.calledOnce();
                    s3.getObject.should.be.calledWithMatch( {
                        Bucket: "bucketOverride",
                        Key: "knownStringKey"
                    } );
                } );

        } );

        it( 'Should fail if no bucket is provided for the request', () => {

            return dbWithoutBucket.get( 'key' )
                .should.be.rejected();

        } );

    } );

    describe( 'Delete', () => {

        it( 'Should allow for deletion of known objects', () => {

            return db.delete( 'knownJSONKey' )
                .then( result => {

                    s3.deleteObject.should.be.calledOnce();
                    s3.deleteObject.should.be.calledWithMatch( {
                        Bucket: "bucket",
                        Key: "knownJSONKey"
                    } );

                } );

        } );

        it( 'Should allow for bucket overrides', () => {

            return db.delete( 'knownJSONKey', 'bucketOverride' )
                .then( result => {

                    s3.deleteObject.should.be.calledOnce();
                    s3.deleteObject.should.be.calledWithMatch( {
                        Bucket: "bucketOverride",
                        Key: "knownJSONKey"
                    } );

                } );

        } );

        it( 'Should fail if no bucket is specified', () => {

            return dbWithoutBucket.delete( 'key' )
                .should.be.rejected();

        } );

        it( 'Should allow for the deletion of multiple objects at once', () => {

            return db.delete( [ 'knownJSONKey', 'knownStringKey' ] )
                .then( result => {

                    s3.deleteObjects.should.be.calledOnce();
                    s3.deleteObjects.should.be.calledWithMatch( {
                        Bucket: "bucket",
                        Delete: {
                            Objects: [
                                { Key: "knownJSONKey" },
                                { Key: "knownStringKey" }
                            ]
                        }
                    } );

                } );

        } );

    } );

    describe( 'List', () => {

        it( 'Should allow for the request of a list of items in a folder', () => {

            return db.list( 'folder/' )
                .then( result => {

                    s3.listObjectsV2.should.be.calledOnce();
                    s3.listObjectsV2.should.be.calledWithMatch( {
                        Bucket: "bucket",
                        Delimiter: "/",
                        Prefix: "folder/"
                    } );

                } );

        } );

        it( 'Should allow for bucket overrides', () => {

            return db.list( 'folder/', 'bucketOverride' )
                .then( result => {

                    s3.listObjectsV2.should.be.calledOnce();
                    s3.listObjectsV2.should.be.calledWithMatch( {
                        Bucket: "bucketOverride",
                        Delimiter: "/",
                        Prefix: "folder/"
                    } );

                } );

        } );

        it( 'Should fail if no bucket is specified', () => {

            return dbWithoutBucket.list( 'folder' )
                .should.be.rejected();

        } );

        it( 'Should append a folder delimiter if one is not provided in the prefix', () => {

            return db.list( 'folder' )
                .then( result => {

                    s3.listObjectsV2.should.be.calledOnce();
                    s3.listObjectsV2.should.be.calledWithMatch( {
                        Bucket: "bucket",
                        Delimiter: "/",
                        Prefix: "folder/"
                    } );

                } );

        } );

    } );

} );