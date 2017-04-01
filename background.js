var accessControlRequestHeaders;
var exposedHeaders;
var originatingDomain = "*";

domains = ["neulion.com", ".go.com", "uplynk.com"];


function requestListener(details){
	var flag = false,
		rule = {
			name: "Origin",
			value: "https://watch.nba.com"
		};
	var i;

	if (domains.some(function(v) { return details.url.indexOf(v) >= 0; })) {
		for (i = 0; i < details.requestHeaders.length; ++i) {
			if (details.requestHeaders[i].name.toLowerCase() === rule.name.toLowerCase()) {
				flag = true;
				originatingDomain = details.requestHeaders[i].value;
				details.requestHeaders[i].value = rule.value;
				break;
			}
		}
		if(!flag) details.requestHeaders.push(rule);
	}
	
	for (i = 0; i < details.requestHeaders.length; ++i) {
		if (details.requestHeaders[i].name.toLowerCase() === "access-control-request-headers") {
			accessControlRequestHeaders = details.requestHeaders[i].value	
		}
	}	
	
	return {requestHeaders: details.requestHeaders};
};

function responseListener(details){
	var flag = false,
	rule = {
			"name": "Access-Control-Allow-Origin",
			"value": originatingDomain
		};
	credentials = {
		"name" : "Access-Control-Allow-Credentials",
		"value" : "true"
	}
	
	if (domains.some(function(v) { return details.url.indexOf(v) >= 0; })) {
		for (var i = 0; i < details.responseHeaders.length; ++i) {
			if (details.responseHeaders[i].name.toLowerCase() === rule.name.toLowerCase()) {
				flag = true;
				details.responseHeaders[i].value = rule.value;
				break;
			}
		}
		if(!flag) details.responseHeaders.push(rule);
		details.responseHeaders.push(credentials);
	}

	if (accessControlRequestHeaders) {

		details.responseHeaders.push({"name": "Access-Control-Allow-Headers", "value": accessControlRequestHeaders});

	}

	if(exposedHeaders) {
		details.responseHeaders.push({"name": "Access-Control-Expose-Headers", "value": exposedHeaders});
	}

	details.responseHeaders.push({"name": "Access-Control-Allow-Methods", "value": "GET, PUT, POST, DELETE, HEAD, OPTIONS"});

	return {responseHeaders: details.responseHeaders};
	
};

/*Add Listeners*/

chrome.webRequest.onBeforeSendHeaders.addListener(
  requestListener,
  {urls: ["<all_urls>"]},
  ["blocking", "requestHeaders"]
);

chrome.webRequest.onHeadersReceived.addListener(
  responseListener,
  {urls: ["<all_urls>"]},
  ["blocking", "responseHeaders"]
);