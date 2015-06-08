var gaSettings = Meteor.settings && Meteor.settings.public &&
                 Meteor.settings.public.ga || {};
var hasCheckedReferrer = window.sessionStorage.getItem('isReferrerSpam') !== null;
var isValidReferrer = window.sessionStorage.getItem('isReferrerSpam') === "false";

if (gaSettings.validateReferralSpam && !hasCheckedReferrer) {
  Meteor.call("validateReferrer", document.referrer, function(error, isSpam){
    if(error){
      console.log("error", error);
    }
    window.sessionStorage.setItem('isReferrerSpam', isSpam);
    if(!isSpam){
      initTracking();
    }
  });
} else if (isValidReferrer && hasCheckedReferrer) {
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
