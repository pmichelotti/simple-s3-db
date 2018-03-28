
const SimpleS3DB = function( s3, bucket ) {

    this.put = function( key, obj ) {
        return new Promise( ( resolve, reject ) => {

            s3.putObject( {
                Bucket: bucket,
                Key: key,
                Body: typeof obj === 'object' ? JSON.stringify( obj ) : obj
            }, ( err, data ) => {
                if ( err ) {
                    return reject( err );
                }

                resolve( data );
            } );

        } );
    };

    this.get = function( key ) {
        return new Promise( ( resolve, reject ) => {

            s3.getObject( {
                Bucket: bucket,
                Key: key
            }, ( err, data ) => {
                if ( err ) {
                    reject( err );
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