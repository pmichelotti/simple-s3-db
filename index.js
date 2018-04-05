
const SimpleS3DB = function( s3, bucket ) {

    this.put = function( key, obj ) {
        return new Promise( ( resolve, reject ) => {

            try {
                s3.putObject( {
                    Bucket: bucket,
                    Key: key,
                    Body: typeof obj === 'object' ? JSON.stringify( obj ) : obj
                }, ( err, data ) => {
                    if ( err ) {
                        return reject( err );
                    }

                    resolve( data );
                });
            } catch( e ) {
                reject( e );
            }

        } );
    };

    this.get = function( key ) {
        return new Promise( ( resolve, reject ) => {

            try {
                s3.getObject( {
                    Bucket: bucket,
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

    this.delete = function( key ) {
        return new Promise( ( resolve, reject ) => {

            if ( Array.isArray( key ) ) {

                try {
                    s3.deleteObjects( {
                        Bucket: bucket,
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
                        Bucket: bucket,
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

    this.list = function( folder ) {

        return new Promise( ( resolve, reject ) => {

            s3.listObjectsV2( {
                Bucket: bucket,
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