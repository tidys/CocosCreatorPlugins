var performTests = function (callback) {
  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    var thisTab = tabs[0];
    chrome.tabs.executeScript(thisTab.id, {file: 'scripts/variable-checker.js'}, function (data) {
      var response = data[0].response;
      callback(response);
    });
  });
};


/*jshint -W030 */

/* global console,document */

function log(msg) {
  console.log('Page var checker ::', msg);
}

function variableChecker() {
  log('running');
  var checkVersion = '0_0_1';

  this._checkPrefix = '__var-checker-' + checkVersion + '-';
  this._elementPrefix = '__var-check' + checkVersion;

  this.response = {};

  // This will get the current jQuery version on the page
  this.response.jQueryPage = this.getPageVar('jQuery.fn.jquery');

  // This will try to read window.et. In this case a .toString() is needed to prevent JSON.stringify a circular object
  this.response.etObject = this.getPageVar('window.et', true);

  log('finished');
  //log(this);
}

variableChecker.prototype.checkElement = function (id) {
  return document.getElementById(id);
};

variableChecker.prototype.getPageVar = function (variable, toString) {
  var _this = this;
  var vName = variable.replace(/\./g, '_').toLowerCase();
  var divName = _this._checkPrefix + vName;
  var scriptName = _this._checkPrefix + vName + '-script';
  try {
    var obj = null;
    var d = document.getElementById(divName);
    if (!d) {
      d = document.createElement('div');
      d.setAttribute('id', divName);
      d.style.display = 'none';
      d.className = _this._elementPrefix;
      document.body.appendChild(d);
    }
    var s = document.getElementById(scriptName);
    if (!s) {
      s = document.createElement('script');
      s.setAttribute('id', scriptName);
      d.className = _this._elementPrefix;
      s.type = 'text/javascript';
    }

    var scriptHtml = [
      'try{document.getElementById("',
      divName,
      '").innerHTML = JSON.stringify({ "',
      vName,
      '" : ',
      variable,
      (toString ? '.toString()' : ''),
      '}) ;}catch(e){document.getElementById("',
      divName,
      '").innerHTML = JSON.stringify({ "',
      vName,
      '" : null });}'
    ].join('');

    s.innerHTML = scriptHtml;

    document.body.appendChild(s);
    //document.body.removeChild(s);

    var json = d.innerHTML;
    try {
      obj = JSON.parse(json);
    } catch (e) {
      return null;
    }
    return obj[vName];
  }
  catch (e) {
    return null;
  }
};

var vaCheck = new variableChecker();

vaCheck;

