var gaSettings = Meteor.settings && Meteor.settings.public &&
                 Meteor.settings.public.ga || {};

var blacklistURL = "https://s3.amazonaws.com/s3.convertify.io/spammers.txt";


if (gaSettings.validateReferralSpam) {
  Meteor.startup(function(){
    HTTP.call("GET", blacklistURL, trackIfValidReferrer);
  });
} else {
  initTracking();
}

function initTracking() {
  if (gaSettings.id) {
      initPreloadAnalyticsHelper();
      initTracker();
      applySettings();
      applyRequires();
  } else {
      initFakeTracker();
  }
}

function trackIfValidReferrer(err, response) {
  if (err) {
    // If for some reason the blacklist is unavailable, skip validation.
    initTracking();
  }
  var spammers = response.content.split('\n');

  var validate = _.find(spammers, function(referrer) {
    if (!referrer.length) {
      return false;
    }
    var re = new RegExp(referrer);
    return re.test(document.referrer);
  });

  var isValid = typeof validate === 'undefined';
  if (isValid) {
    window.localStorage.setItem('isReferralSpam', false);
    initTracking();
  } else {
    window.localStorage.setItem('isReferralSpam', true);
  }
}

function initPreloadAnalyticsHelper() {
    window.ga = window.ga || function(){(ga.q=ga.q||[]).push(arguments);};
    ga.l = +new Date();
}

function initTracker() {
    var createOptions = gaSettings.create || 'auto';

    window.ga('create', gaSettings.id, createOptions);
}

function initFakeTracker() {
    var hasRun = false;
    window.ga = function() {
        if (!hasRun) {
            hasRun = true;
            console.warn('iron-router-ga: settings not found');
        }
    };
}

function applySettings() {
    if (!gaSettings.set) { return; }

    for (var key in gaSettings.set) {
        if (gaSettings.set.hasOwnProperty(key)) {
            window.ga('set', key, gaSettings.set[key]);
        }
    }
}

function applyRequires() {
    var requireValue;

    if (!gaSettings.require) { return; }

    for (var key in gaSettings.require) {
        if (gaSettings.require.hasOwnProperty(key)) {
            requireValue = gaSettings.require[key];
            if (typeof requireValue === 'string') {
                window.ga('require', key, requireValue);
            } else {
                window.ga('require', key);
            }
        }
    }
}
