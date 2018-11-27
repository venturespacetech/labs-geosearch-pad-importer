require('dotenv').config();

var streams = {};

streams.csvParser = require('./csv_parser').create;
streams.docConstructor = require('./document_constructor');
streams.adminLookup = require('./admin_lookup');
streams.dbMapper = require('pelias-model').createDocumentMapperStream;
streams.elasticsearch = require('pelias-dbclient');

// default import pipeline
streams.import = function(){
  streams.csvParser()
    .pipe( streams.docConstructor() )
    .pipe( streams.adminLookup() )
    .pipe( streams.dbMapper() )
    .pipe( streams.elasticsearch() );
};

module.exports = streams;
