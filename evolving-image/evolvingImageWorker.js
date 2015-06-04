importScripts("evolvingImage.js");
var targetImage;

onmessage = function (e) {
  var message = e.data.type;
  var payload = e.data.payload;
  if (!message) return;

  switch (message) {
    case "init":
      break;
    case "start":
      break;
    case "stop":
      break;
  }
};