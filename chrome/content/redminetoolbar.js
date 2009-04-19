var RmTb= {

  Init : function() {
    // Set the project title to be the current project title
    RmTb.Change_Project_Label();
    window.getBrowser().addProgressListener(RMTB_Listener, Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);  
  },

  Change_Project_Label : function() {
    var projButton = document.getElementById('RmTb-Project-Button');
    if (projButton)
      projButton.setAttribute('label', RmTb.getPref('currentproject'));
  },

  Exit : function() {
  },

  loadUrl : function(url) {
    window._content.document.location = url;
    window.content.focus();
  },

  loadPage : function(page) {
    var url = "";
    var host = RmTb.getPref('host');
    var currProj = RmTb.getPref('currentproject');
    
    switch(page) {
      case 'MYPAGE':
        url = host + "/my/page";
        break;
      case 'OVERVIEW':
        url = host + "/projects/show/" + currProj + "";
        break;
      case 'ISSUES':
        url = host + "/projects/" + currProj + "/issues";
        break;
      case 'NEWISSUE':
        url = host + "/projects/" + currProj + "/issues/new";
        break;
      case 'NEWS':
        url = host + "/projects/" + currProj + "/news";
        break;
      case 'DOCS':
        url = host + "/projects/" + currProj + "/documents";
        break;
      case 'WIKI':
        url = host + "/wiki/" + currProj + "";
        break;
      case 'FILES':
        url = host + "/projects/list_files/" + currProj + "";
        break;
      case 'REPOSITORY':
        url = host + "/repositories/show/" + currProj + "";
        break;
      default:
        alert('No such page: ' + page);
    }

    RmTb.loadUrl(url);
  },

  Populate : function() {
    // Maximum number of menu items
    const MAXENTRIES = 30;

    // Get the menupopup element that we will be working with
    var menu = document.getElementById("RmTb-Activity-Popup");

    // Remove all exisiting items first, otherwise the newly created items
    // are appended to the list
    for (var i=menu.childNodes.length - 1; i >= 0; i--) {
      menu.removeChild(menu.childNodes.item(i));
    }

    var host = RmTb.getPref('host');
    var currProj = RmTb.getPref('currentproject');

    var xhr = new XMLHttpRequest();
    xhr.open("GET", host + "/projects/" + currProj + "/activity.atom", true);
    xhr.onreadystatechange = function() {
      if(xhr.readyState == 4) {
        if(xhr.status == 200) {
          var doc = xhr.responseXML;
          resolver = function() {
          return 'http://www.w3.org/2005/Atom';
        };
        var entryElements = doc.evaluate('//myns:entry', doc, resolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        nbEntries = (entryElements.snapshotLength > MAXENTRIES) ? MAXENTRIES : entryElements.snapshotLength;
        for (var i=0; i < nbEntries; i++) {
          // Get the single item
          var entryItem = entryElements.snapshotItem(i);

          // Create a new menu item to be added
          var tempItem = document.createElement("menuitem");
          
          // Get the label from the feed entry
          var title = entryItem.getElementsByTagName('title')[0].firstChild.nodeValue; 

          // Set the new menu item's label
          tempItem.setAttribute("label", title);
          
          // Add a menu icon
          if (RmTb.StartsWith(title, "Wiki edit"))
            tempItem.setAttribute("class", "RmTb-Activity-Wiki-Edit");
          else if (RmTb.StartsWith(title, "Revision")) 
            tempItem.setAttribute("class", "RmTb-Activity-Changeset");
          else if (RmTb.StartsWith(title, "Feature")) 
            tempItem.setAttribute("class", "RmTb-Activity-Feature");
          else if (RmTb.StartsWith(title, "Patch")) 
            tempItem.setAttribute("class", "RmTb-Activity-Patch");

          // get the URL from the feed entry
          var url = entryItem.getElementsByTagName('link')[0].getAttribute('href');

          // Set the new menu item's action
          tempItem.setAttribute("oncommand", "RmTb.loadUrl('" + url + "');");

          // Add the item to out menu
          menu.appendChild(tempItem);
        }
      }
      else
        alert(xhr.status);
      }
    };
    xhr.send(null);
  },

  StartsWith : function(haystack, needle) {
    return haystack.substr(0, needle.length) === needle;
  },

  Wiki_Populate : function() {
    var menu = document.getElementById("RmTb-Wiki-Popup");

    // Remove all exisiting items first, otherwise the newly created items
    // are appended to the list. Skip 
    var skipEntries = 2;
    for (var i=menu.childNodes.length - 1; i >= skipEntries; i--) {
      menu.removeChild(menu.childNodes.item(i));
    }

    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                 .getService(Components.interfaces.nsIPrefService);
    var branch = prefs.getBranch("extensions.redminetoolbar.projects." + RmTb.getPref("currentproject") + ".wikipage.");
    var children = branch.getChildList("", {});

    for (var j=children.length -1; j >= 0; j--) {
      var tempItem = document.createElement("menuitem");
      tempItem.setAttribute("label", branch.getCharPref(children[j]));
      var link = RmTb.getPref('host') + '/wiki/' + RmTb.getPref('currentproject') + '/' + branch.getCharPref(children[j]);
      tempItem.setAttribute("oncommand", "RmTb.loadUrl('" + link + "');");
      menu.appendChild(tempItem);
    }
  },

  getPref : function(pref) {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                  .getService(Components.interfaces.nsIPrefService);
    var branch = prefs.getBranch("extensions.redminetoolbar.");
    return branch.getCharPref(pref);
  },

  PopulateProjects : function() {
    var menu = document.getElementById("RmTb-Project-Popup");
    
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                  .getService(Components.interfaces.nsIPrefService);
    var branch = prefs.getBranch("extensions.redminetoolbar.projects.name");
    var children = branch.getChildList("", {});

    // Remove all exisiting items first, otherwise the newly created items
    // are appended to the list. Skip 
    for (var i=menu.childNodes.length - 1; i >= 0; i--) {
      menu.removeChild(menu.childNodes.item(i));
    }
    
    for (var j=children.length -1; j >= 0; j--) {
      var tempItem = document.createElement("menuitem");
      var projectName = branch.getCharPref(children[j]);
      tempItem.setAttribute("label", projectName);
      tempItem.setAttribute("oncommand", "RmTb.Change_Project('" + projectName + "');");
      menu.appendChild(tempItem);
    }
  },

  Change_Project : function(projectName) {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                    .getService(Components.interfaces.nsIPrefService);
    var branch = prefs.getBranch("extensions.redminetoolbar.");
    branch.setCharPref("currentproject", projectName);
  },

  showOptions : function() {
    window.openDialog("chrome://redminetoolbar/content/options.xul", "Redmine Toolbar Options", "centerscreen,chrome,modal");
  }
};

var RMTB_Listener = {
  onLocationChange: function(progress, request, location) {
    if (location) {
      // do something on location change
    }
  },

  onProgressChange: function(webprogress, request, curselfprogres, maxselfprogress, curtotalprogress, maxtotalprogress) {},
  onStatusChange: function(webprogress, request, status, message) {}, 
  onSecurityChange: function(webprogress, request, state) {},
  onLinkIconAvailable: function(a) {},
  onStateChange: function(webprogress, request, stateFlags, status) {
    if (stateFlags & Components.interfaces.nsIWebProgressListener.STATE_STOP) {
      // do something when page has finished loading
    }
  }
};

var redminePrefObserver = {
  register: function() {
    // First we'll need the preference services to look for preferences.
    var prefService = Components.classes["@mozilla.org/preferences-service;1"]
                                .getService(Components.interfaces.nsIPrefService);

    // For this._branch we ask that the preferences for extensions.myextension. and children
    this._branch = prefService.getBranch("extensions.redminetoolbar.");

    // Now we queue the interface called nsIPrefBranch2. This interface is described as:  
    // "nsIPrefBranch2 allows clients to observe changes to pref values."
    this._branch.QueryInterface(Components.interfaces.nsIPrefBranch2);

    // Finally add the observer.
    this._branch.addObserver("", this, false);
  },

  unregister: function() {
    if(!this._branch) return;
    this._branch.removeObserver("", this);
  },

  observe: function(aSubject, aTopic, aData) {
    if(aTopic != "nsPref:changed") return;
    // aSubject is the nsIPrefBranch we're observing (after appropriate QI)
    // aData is the name of the pref that's been changed (relative to aSubject)
    switch (aData) {
      case "pref1":
        // extensions.myextension.pref1 was changed
        break;
      case "pref2":
        // extensions.myextension.pref2 was changed
        break;
    }
  }
}
redminePrefObserver.register();

function PrefListener(branchName, func) {
  var prefService = Components.classes["@mozilla.org/preferences-service;1"]
                              .getService(Components.interfaces.nsIPrefService);
  var branch = prefService.getBranch(branchName);
  branch.QueryInterface(Components.interfaces.nsIPrefBranch2);

  this.register = function() {
    branch.addObserver("", this, false);
    branch.getChildList("", { })
          .forEach(function (name) { func(branch, name); });
  };

  this.unregister = function unregister() {
    if (branch)
      branch.removeObserver("", this);
  };

  this.observe = function(subject, topic, data) {
    if (topic == "nsPref:changed")
      func(branch, data);
    };
}

var redminePrefListener = new PrefListener("extensions.redminetoolbar.",
  function(branch, name) {
    switch (name) {
      case "currentproject":
        RmTb.Change_Project_Label(); 
        break;
    }
});
redminePrefListener.register();