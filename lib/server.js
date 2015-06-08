Spammers = new Mongo.Collection('spammers');

Meteor.methods({
  validateReferrer: function( referrer ){
    var spammers = Spammers.find();
    var isSpam = false;
    spammers.forEach(function(spammer, i) {
      var re = new RegExp(spammer.host);
      if ( re.test(referrer) ) {
        isSpam = true;
      }
    });
    return isSpam;
  },
  updateSpammersList: function( listURL ) {
    var listURL = listURL || "https://s3.amazonaws.com/s3.convertify.io/spammers.txt";
    HTTP.call("GET", listURL, function(err, response) {
      var spammers = response.content.split('\n');
      var cursor = Spammers.find();
      cursor.count() > 0 && Spammers.dropCollection();
      _.each(spammers, function(spammer, i) {
        if (spammer !== "") {
          Spammers.insert({host: spammer});
        }
      });
      return spammers.length + ' records inserted (new count: ' + cursor.count() + ')';
    });
  }
});