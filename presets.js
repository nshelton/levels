var sequence = [];
var current_preset = ""
var current_preset_index = 0

function setPreset(name) {
  current_preset = name;
  current_preset_index = sequence.indexOf(name);

  $(".preset").removeClass("selected");
  $("."+name).addClass("selected")

  gui2.preset = name;
  gui.preset = name;

}

function nextPreset(name) {
  var next = current_preset_index + 1;

  if ( next >= sequence.length)
    next -= sequence.length;

  setPreset(sequence[next]);
}
function lastPreset(name) {
  var next = current_preset_index - 1;

  if ( next < 0 )
    next += sequence.length;

  setPreset(sequence[next]);
}

function updateSequence() {
  sequence = [];

  var ps = $(".preset");
  for ( var i = 0; i < ps.length; i ++) {
    sequence.push($(ps[i]).text());
  }

  localStorage.setItem("seq", "");
  localStorage.setItem("seq", sequence);
}

function loadSequence() {

  localStorage.setItem("seq", threeDWebFest.seq);
  localStorage.setItem(location.href+".gui", threeDWebFest["http://localhost:3000/.gui"]);
  localStorage.setItem(location.href+".isLocal", true);
  setupPresetUI()

}

function setupPresetUI() {

  var load = $("<button>  </button>");
  load.text("Load Sequence");

  load.click(function() {
    alert("loaded")
    loadSequence();
  });

  $("#overlay").append( load );


  var presets = JSON.parse(localStorage.getItem(location.href+".gui"));
  
  if (!presets)
    return;

  var outer = $("<div>  </div>");
  outer.addClass("presetHolder");

  unorderedPresets = {};

  for ( preset in presets.remembered) {
    var item = $("<div>  </div>");

    item.text(preset);
    item.addClass("preset");
    item.addClass(preset);
    item.name = preset;

    item.dblclick(function() {
      setPreset($(this).text());
    });

    unorderedPresets[preset] = item;
  }
  sequence = localStorage.getItem("seq").split(",");

  console.log(unorderedPresets)
  console.log(sequence)
   
  for ( var i = 0; i < sequence.length; i ++) {
    outer.append(unorderedPresets[sequence[i]]);
    delete unorderedPresets[sequence[i]];
}

  for ( var newp in unorderedPresets)
  {
    outer.append(unorderedPresets[newp]);
    console.log(newp)
  }

   
  $("#overlay").append( outer );

  var list = dragula([document.querySelector('.presetHolder')],)

  updateSequence()


  list.on("dragend", function(el) {
    updateSequence();
  });
  

}




