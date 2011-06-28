var PlanioToolbar= {

  urlExists : false,

  planioToolbarPrefListener : null,
  
  Init : function() {
    // Initialize and register preferences listener
    PlanioToolbar.planioToolbarPrefListener = new PlanioToolbar.PrefListener("extensions.planiotoolbar.",
      function(branch, name) {
        switch (name) {
          case "currentproject":
            PlanioToolbar.Change_Project_Label(); 
            break;
        }
    });
    PlanioToolbar.planioToolbarPrefListener.register();
    
    // Set the project title to be the current project title
    PlanioToolbar.Change_Project_Label();
  },

  Change_Project_Label : function() {
    var projButton = document.getElementById('PlanioToolbar-Project-Button');
    if (projButton)
       projButton.setAttribute('label', PlanioToolbar.getPref('currentproject') || 'No Project configured');
  },

  Exit : function() {
  },

  loadUrl : function(url) {
    window._content.document.location = url;
    window.content.focus();
  },

  loadPage : function(page) {
    var url = "";
    var host = PlanioToolbar.getProjectUrl();
    if(host){
      var currProj = PlanioToolbar.getPref('currentproject');
    
      switch(page) {
        case 'MYPAGE':
          url = host + "/my/page";
          break;
        case 'OVERVIEW':
          url = host + "/projects/" + currProj + "";
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
          url = host + "/projects/" + currProj + "/wiki";
          break;
        case 'FILES':
          url = host + "/projects/" + currProj + "/files";
          break;
        case 'REPOSITORY':
          url = host + "/projects/" + currProj + "/repository";
          break;
        default:
          alert('No such page: ' + page);
      }
      PlanioToolbar.loadUrl(url);
    }else{
      PlanioToolbar.showOptions();
    }
  },

  getFeed : function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
      if(xhr.readyState == 4) {
        if(xhr.status == 200) {
          PlanioToolbar.Populate(xhr.responseXML);
        }
      }
    }
    xhr.send(null);
  },

  PopulateActivities : function() {
    var host = PlanioToolbar.getProjectUrl();
    if(host){
      var currProj = PlanioToolbar.getPref('currentproject');
      var url = host + "/projects/activity/" + currProj + "?format=atom";
      if (PlanioToolbar.UrlExists(url)) {
  			PlanioToolbar.getFeed(url);
  		} else {
  			url = host + "/projects/" + currProj + "/activity.atom";
  			PlanioToolbar.getFeed(url);
  		}
		}else{
      PlanioToolbar.showOptions();
		}
  },

  UrlExists : function(url) {
		var xhr = new XMLHttpRequest();
		xhr.open("HEAD", url, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
			  if (xhr.status == 200) {
					PlanioToolbar.urlExists = true;
				}
			}
		}
		xhr.send(null);
		return PlanioToolbar.urlExists;
	},

  Populate : function(doc) {
    // Maximum number of menu items
    const MAXENTRIES = 30;

    // Get the menupopup element that we will be working with
    var menu = document.getElementById("PlanioToolbar-Activity-Popup");

    // Remove all exisiting items first, otherwise the newly created items
    // are appended to the list
    for (var i=menu.childNodes.length - 1; i >= 0; i--) {
      menu.removeChild(menu.childNodes.item(i));
    }

    var resolver = function() { return 'http://www.w3.org/2005/Atom'; };
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
      if (PlanioToolbar.StartsWith(title, "Wiki edit"))
        tempItem.setAttribute("class", "PlanioToolbar-Activity-Wiki-Edit");
      else if (PlanioToolbar.StartsWith(title, "Revision")) 
        tempItem.setAttribute("class", "PlanioToolbar-Activity-Changeset");
      else if (PlanioToolbar.StartsWith(title, "Feature")) 
        tempItem.setAttribute("class", "PlanioToolbar-Activity-Feature");
      else if (PlanioToolbar.StartsWith(title, "Patch")) 
        tempItem.setAttribute("class", "PlanioToolbar-Activity-Patch");

      // get the URL from the feed entry
      var url = entryItem.getElementsByTagName('link')[0].getAttribute('href');

      // Set the new menu item's action
      tempItem.setAttribute("href", url);
      tempItem.setAttribute("oncommand", "PlanioToolbar.loadUrl(this.getAttribute('href'));");

      // Add the item to out menu
      menu.appendChild(tempItem);
    }
  },

  StartsWith : function(haystack, needle) {
    return haystack.substr(0, needle.length) === needle;
  },

  Wiki_Populate : function() {
    if(PlanioToolbar.getProjectUrl()){
    
      var menu = document.getElementById("PlanioToolbar-Wiki-Popup");

      // Remove all exisiting items first, otherwise the newly created items
      // are appended to the list. Skip 
      var skipEntries = 3;
      for (var i=menu.childNodes.length - 1; i >= skipEntries; i--) {
        menu.removeChild(menu.childNodes.item(i));
      }

      var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                   .getService(Components.interfaces.nsIPrefService);
      var branch = prefs.getBranch("extensions.planiotoolbar.project." + PlanioToolbar.getPref("currentproject") + ".wikipage.");
      var children = branch.getChildList("", {});

      for (var j=children.length -1; j >= 0; j--) {
        var link = PlanioToolbar.getProjectUrl() + '/wiki/' + PlanioToolbar.getPref('currentproject') + '/' + branch.getCharPref(children[j]);
        var tempItem = document.createElement("menuitem");
        tempItem.setAttribute("label", branch.getCharPref(children[j]));
        var link = PlanioToolbar.getProjectUrl() + '/wiki/' + PlanioToolbar.getPref('currentproject') + '/' + branch.getCharPref(children[j]);
        tempItem.setAttribute("href", link);
        tempItem.setAttribute("oncommand", "PlanioToolbar.loadUrl(this.getAttribute('href'));");
        menu.appendChild(tempItem);
      }
    }else{
      PlanioToolbar.showOptions();
    }
  },

  getProjectUrl : function() {
    var currentProject = PlanioToolbar.getPref('currentproject');
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                  .getService(Components.interfaces.nsIPrefService);
    var branch = prefs.getBranch("extensions.planiotoolbar.projects.name");
    var children = branch.getChildList("", {});
    for (var i = 0; i < children.length; i++) {
    if (prefs.getCharPref("extensions.planiotoolbar.projects.name." + i) == currentProject)
      return prefs.getCharPref("extensions.planiotoolbar.projects.url." + i);
    }
	return false;
  },

  getPref : function(pref) {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                  .getService(Components.interfaces.nsIPrefService);
    var branch = prefs.getBranch("extensions.planiotoolbar.");
    if (branch.prefHasUserValue(pref)) {
      return branch.getCharPref(pref);
    }else{
      return false;
    }

  },

  PopulateProjects : function() {
    var menu = document.getElementById("PlanioToolbar-Project-Popup");
    
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                  .getService(Components.interfaces.nsIPrefService);
    var branch = prefs.getBranch("extensions.planiotoolbar.projects.name");
    var children = branch.getChildList("", {});

    while (menu.hasChildNodes())
      menu.removeChild(menu.firstChild);

    for (var i = 0; i < children.length; i++) { 
      var tempItem = document.createElement("menuitem");
      var projectName = branch.getCharPref(children[i]);
      tempItem.setAttribute("label", projectName);
      tempItem.setAttribute("oncommand", "PlanioToolbar.Change_Project(this.getAttribute('label'));");
      menu.appendChild(tempItem);
    }
  },

  Change_Project : function(projectName) {
    var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                    .getService(Components.interfaces.nsIPrefService);
    var branch = prefs.getBranch("extensions.planiotoolbar.");
    branch.setCharPref("currentproject", projectName);
  },

  showOptions : function() {
    var x = window.openDialog("chrome://planiotoolbar/content/options.xul",
      "Planio Toolbar Options", "centerscreen=yes,chrome=yes,modal=yes,resizable=yes");
  },
  
  showWikipagesDialog : function() {
    var x = window.openDialog("chrome://planiotoolbar/content/wikipages.xul",
      "Planio Toolbar Wikipages", "centerscreen=yes,chrome=yes,modal=yes,resizable=yes");
  },
  
  showAboutDialog : function() {
    var x = window.openDialog("chrome://planiotoolbar/content/about.xul",
      "Planio Toolbar About", "centerscreen=yes,chrome=yes,modal=yes,resizable=yes");
  },

  PrefListener : function(branchName, func) {
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

}; // End of PlanioToolbar
