var PlanioToolbar_Wikipages = {

  load : function() {
    const prefService = Components.classes["@mozilla.org/preferences-service;1"]
                                  .getService(Components.interfaces.nsIPrefService);
	const curProj = prefService.getBranch("extensions.planiotoolbar.").getCharPref("currentproject");
    const branch = prefService.getBranch("extensions.planiotoolbar.project." + curProj + ".wikipage.");
    
	// List of projects
    var names = branch.getChildList("", {});
    for (var i = 0; i < names.length; i++) {
      PlanioToolbar_Wikipages.addToList(branch.getCharPref(i));
    }
  },

  save : function() {
    const prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    const branch = prefService.getBranch("extensions.planiotoolbar.");
	const curProj = prefService.getBranch("extensions.planiotoolbar.").getCharPref("currentproject");
 
    // Remove all wiki pages first ...  
    branch.deleteBranch("project." + curProj + ".wikipage");

    // and add them again
    var pagesList = document.getElementById("PlanioToolbar-Wikipages-Pages");
    var pages = pagesList.getElementsByTagName("listitem");
    for (var i = 0; i < pages.length; i++) {
      var items = pages[i].childNodes;
      branch.setCharPref("project." + curProj + ".wikipage." + i, items[0].getAttribute("label"));
    }
  },

  addOrEdit: function() {
    if (document.getElementById("PlanioToolbar-Wikipage-AddEditName").value != "") {
      PlanioToolbar_Wikipages.addToList(document.getElementById("PlanioToolbar-Wikipage-AddEditName").value);
    }
  },

  addToList : function(name) {
    var pagesList = document.getElementById("PlanioToolbar-Wikipages-Pages");
    var pages = document.createElement("listitem");
    var pName = document.createElement("listcell");
    pName.setAttribute("label", name);
    pages.appendChild(pName);
    pagesList.appendChild(pages);
  },

  removeAll: function() {
    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                            .getService(Components.interfaces.nsIPromptService);
    var check = {value: false};
    var result = prompts.confirmCheck(window, "Planio Toolbar", 
                        "Do you really want to remove all wiki pages?",
                        "Do not ask me again", check);

    if (result) {
      var pagesList = document.getElementById("PlanioToolbar-Wikipages-Pages");
      var elements = pagesList.getElementsByTagName("listitem");
      for (var i = elements.length-1; i >= 0; i--) {
        elements[i].parentNode.removeChild(elements[i]); 
      }
    }
  },

  remove: function() {
    var pagesList = document.getElementById("PlanioToolbar-Wikipages-Pages");
    var elements = pagesList.getElementsByTagName("listitem");
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].hasAttribute("selected"))
        elements[i].parentNode.removeChild(elements[i]); 
    }
  } 
};
