var SlackWebhook = require('slack-webhook');
var os = require('os');

require('dotenv').config();

var slack = new SlackWebhook(process.env.SLACK_WEBHOOK_URL, {
  defaults: {
    username: 'GeoSearch Import Bot',
    channel: '#labs-geocoder-api',
    icon_emoji: ':robot_face:'
  }
});

var streams = {};

streams.csvParser = require('./csv_parser').create;
streams.docConstructor = require('./document_constructor');
streams.adminLookup = require('./admin_lookup');
streams.dbMapper = require('pelias-model').createDocumentMapperStream;
streams.elasticsearch = require('pelias-dbclient');

// default import pipeline
streams.import = function(){

  slack.send(`Starting NYCPAD Pelias Import on ${os.hostname()}`);
  var stream = streams.csvParser()
    .pipe( streams.docConstructor() )
    .pipe( streams.adminLookup() )
    .pipe( streams.dbMapper() )
    .pipe( streams.elasticsearch() );

  stream.on('finish', function () {
    slack.send(`NYCPAD Pelias Import on ${os.hostname()} Finished!`);
  });
};

module.exports = streams;
