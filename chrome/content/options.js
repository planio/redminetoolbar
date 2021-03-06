var PlanioToolbar_Options = {

  load : function() {
    const prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    const branch = prefService.getBranch("extensions.planiotoolbar.projects.");

    // List of projects
    var names = branch.getChildList("name.", {});
    for (var i = 0; i < names.length; i++) {
      PlanioToolbar_Options.addToProjectList(
        branch.getCharPref("name." + i),
        branch.getCharPref("url." + i));
    }
  },

  save : function() {
    const prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
    const branch = prefService.getBranch("extensions.planiotoolbar.");
 
    // Remove all projects first ...  
    branch.deleteBranch("projects.name");
    branch.deleteBranch("projects.url");

    // and add them again
    var projectList = document.getElementById("PlanioToolbar-Opt-Projects");
    var projects = projectList.getElementsByTagName("listitem");
    for (var i = 0; i < projects.length; i++) {
      var items = projects[i].childNodes;
      branch.setCharPref("projects.name." + i, items[0].getAttribute("label"));
      branch.setCharPref("projects.url." + i, items[1].getAttribute("label"));
    }
  },

  addOrEditProject : function() {
    if (   document.getElementById("PlanioToolbar-Opt-AddEditName").value != ""
        && document.getElementById("PlanioToolbar-Opt-AddEditUrl").value != "") {
      PlanioToolbar_Options.addToProjectList(
        document.getElementById("PlanioToolbar-Opt-AddEditName").value,
        document.getElementById("PlanioToolbar-Opt-AddEditUrl").value); 
    }
  },

  addToProjectList : function(name, url) {
    const prefService = Components.classes["@mozilla.org/preferences-service;1"]
                                  .getService(Components.interfaces.nsIPrefService);
    const branch = prefService.getBranch("extensions.planiotoolbar.");
    var projectList = document.getElementById("PlanioToolbar-Opt-Projects");
    var project = document.createElement("listitem");
    var pName = document.createElement("listcell");
    pName.setAttribute("label", name);
    var pUrl  = document.createElement("listcell");
    pUrl.setAttribute("label", url);
    project.appendChild(pName);
    project.appendChild(pUrl);
    projectList.appendChild(project);
  },

  removeAllProjects : function() {
    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                            .getService(Components.interfaces.nsIPromptService);
    var check = {value: false};
    var result = prompts.confirmCheck(window, "Planio Toolbar", 
                        "Do you really want to remove all projects?",
                        "Do not ask me again", check);

    if (result) {
      var projectList = document.getElementById("PlanioToolbar-Opt-Projects");
      var elements = projectList.getElementsByTagName("listitem");
      for (var i = elements.length-1; i >= 0; i--) {
        elements[i].parentNode.removeChild(elements[i]); 
      }
    }
  },

  removeProject : function() {
    var projectList = document.getElementById("PlanioToolbar-Opt-Projects");
    var elements = projectList.getElementsByTagName("listitem");
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].hasAttribute("selected"))
        elements[i].parentNode.removeChild(elements[i]); 
    }
  } 
};
