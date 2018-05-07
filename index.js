
const SimpleS3DB = function( s3, bucket ) {

    this.put = function( key, obj, o ) {
        const options = o || {};

        return new Promise( ( resolve, reject ) => {

            if ( !( options.bucket || bucket ) ) {
                return reject( new Error( 'No bucket provided for PUT request' ) );
            }

            try {
                const s3Object = {
                    Bucket: options.bucket || bucket,
                    Key: key,
                    Body: typeof obj === 'object' ? JSON.stringify( obj ) : obj
                };

                Object.keys( options ).forEach( currentOptionKey => {
                    if ( currentOptionKey !== 'bucket' ) {
                        s3Object[ currentOptionKey ] = options[ currentOptionKey ];
                    }
                } );

                s3.putObject( s3Object, ( err, data ) => {
                    if ( err ) {
                        return reject( err );
                    }

                    resolve( obj );
                } );
            } catch( e ) {
                reject( e );
            }

        } );
    };

    this.get = function( key, bucketOverride ) {
        return new Promise( ( resolve, reject ) => {

            if ( !( bucketOverride || bucket ) ) {
                return reject( new Error( 'No bucket provided for Get request' ) );
            }

            try {
                s3.getObject( {
                    Bucket: bucketOverride || bucket,
                    Key: key
                }, ( err, data ) => {
                    if ( err ) {
                        return reject( err );
                    }
                    if ( !data ) {
                        // TODO: Determine if I need this here - when testing locally the AWS SDK errors when an object is not found - in Lambda however data just comes back as null with no err object
                        const error = new Error( 'No data returned' );
                        error.statusCode = 404;
                        return reject( error );
                    }

                    try {
                        resolve( {
                            data: JSON.parse( data.Body )
                        } );
                    } catch ( e ) {
                        resolve( {
                            data: data.Body
                        } );
                    }
                } );
            } catch( e ) {
                reject( e );
            }

        } );
    };

    this.delete = function( key, bucketOverride ) {
        return new Promise( ( resolve, reject ) => {

            if ( !( bucketOverride || bucket ) ) {
                return reject( new Error( 'No bucket provided for DELETE request' ) );
            }

            if ( Array.isArray( key ) ) {

                try {
                    s3.deleteObjects( {
                        Bucket: bucketOverride || bucket,
                        Delete: {
                            Objects: key.map( currentKey => {
                                return { Key: currentKey }
                            } )
                        }
                    }, ( err, data ) => {
                        if ( err ) {
                            return reject( err );
                        }

                        resolve( data );
                    } );
                } catch( e ) {
                    reject( e );
                }

            } else {

                try {
                    s3.deleteObject({
                        Bucket: bucketOverride || bucket,
                        Key: key
                    }, (err, data) => {
                        if (err) {
                            return reject(err);
                        }

                        resolve(data);
                    });
                } catch (e) {
                    reject(e);
                }

            }

        } );
    };

    this.list = function( folder, bucketOverride ) {

        return new Promise( ( resolve, reject ) => {

            if ( !( bucketOverride || bucket ) ) {
                return reject( new Error( 'No bucket provided for LIST request' ) );
            }

            s3.listObjectsV2( {
                Bucket: bucketOverride || bucket,
                Delimiter: "/",
                Prefix: folder.endsWith( '/' ) ? folder : folder + '/'
            }, ( err, data ) => {

                if ( err ) {
                    return reject( err );
                }

                resolve( {
                    data: data.Contents.map( currentItem => currentItem.Key )
                } );

            } );

        } );

    };

};

module.exports = SimpleS3DB;