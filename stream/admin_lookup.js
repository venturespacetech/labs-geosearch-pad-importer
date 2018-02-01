var through = require('through2');
var peliasLogger = require( 'pelias-logger' ).get( 'nycpad' );

const countyMap = {
  1: 'New York County',
  2: 'Bronx County',
  3: 'Kings County',
  4: 'Queens County',
  5: 'Richmond',
};

const boroughMap = {
  1: 'Manhattan',
  2: 'Bronx',
  3: 'Brooklyn',
  4: 'Queens',
  5: 'Staten Island',
};

module.exports = function(){
  var stream = through.obj( function( item, enc, next ) {

    try {
      var doc = item;

      doc.addParent('country', 'United States', '85633793', 'USA');
      doc.addParent('region', 'New York State', '0', 'NY');
      doc.addParent('locality', 'New York', '0', 'NYC');

      // map borocode to borough and county properties
      var borocode = doc._meta.pad_bbl.charAt(0);
      if (['1','2','3','4','5'].indexOf(borocode) === -1) {
        throw 'Bad BBL';
      }

      var county = countyMap[borocode];
      var borough = boroughMap[borocode];

      doc.addParent('county', county, borocode);
      doc.addParent('borough', borough, borocode);

      // Push instance of Document downstream
      this.push( doc );
    }

    catch( e ){
      peliasLogger.error( 'error appending admin boundaries', e.stack );
    }

    return next();

  });

  // catch stream errors
  stream.on( 'error', peliasLogger.error.bind( peliasLogger, __filename ) );

  return stream;
};
