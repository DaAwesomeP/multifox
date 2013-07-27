/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


function windowLocalStorage(obj, contentDoc) {
  var profileId = FindIdentity.fromContent(contentDoc.defaultView).profileNumber;

  if (Profile.isNativeProfile(profileId)) {
    console.trace("windowLocalStorage", profileId);
    return;
  }


  var originalUri = stringToUri(contentDoc.location.href);
  var uri = toInternalUri(originalUri, profileId);
  var principal = Services.scriptSecurityManager.getNoAppCodebasePrincipal(uri);

  var storage;
  if ("createStorage" in Services.domStorageManager) {
    storage = Services.domStorageManager.createStorage(principal, "");
  } else {
    storage = Services.domStorageManager.getLocalStorageForPrincipal(principal, "");
  }


  var rv = undefined;
  switch (obj.cmd) {
    case "clear":
      storage.clear();
      break;
    case "removeItem":
      storage.removeItem(obj.key);
      break;
    case "setItem":
      storage.setItem(obj.key, obj.val); // BUG it's ignoring https
      break;
    case "getItem":
      rv = storage.getItem(obj.key);
      break;
    case "key":
      rv = storage.key(obj.index);
      break;
    case "length":
      rv = storage.length;
      break;
    default:
      throw "localStorage interface unknown: " + obj.cmd;
  }

  console.log("localStorage", uri.spec, obj.cmd, obj.key, typeof rv);
  return rv;
}


function stringToUri(spec) {
  try {
    return Services.io.newURI(spec, null, null);
  } catch (ex) {
    return null;
  }
}
