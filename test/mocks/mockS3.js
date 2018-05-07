const sinon = require( 'sinon' );

const mockS3Factory = function( erroring ) {

    const mockS3 = {
        putObject: function( options, callback ) {
            if ( erroring ) {
                return callback( new Error() );
            }

            callback( null, {} );
        },
        getObject: function( options, callback ) {

            const objects = {
                "knownJSONKey": JSON.stringify( { a: 1 } ),
                "knownStringKey": "string value"
            };

            if ( erroring ) {
                return callback( new Error() );
            }

            if ( options.Key && objects[ options.Key ] ) {
                callback( null, { Body: objects[ options.Key ] } );
            }

            callback( new Error() );
        },
        deleteObjects: function( options, callback ) {
            if ( erroring ) {
                return callback( new Error() );
            }

            callback( null, {} );
        },
        deleteObject: function( options, callback ) {
            if ( erroring ) {
                return callback( new Error() );
            }

            callback( null, {} );
        },
        listObjectsV2: function( options, callback ) {
            if ( erroring ) {
                return callback( new Error() );
            }

            callback( null, {
                Contents: []
            } );
        }
    };

    Object.keys( mockS3 )
        .forEach( currentOperation => {
            sinon.spy( mockS3, currentOperation );
        } );

    return mockS3;

};

module.exports = mockS3Factory;
