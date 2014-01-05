// lib.js 20140103 sam & yap

// https://github.com/llad/chrome-serial-monitor/blob/master/lib/serial.js

getPorts = function (onPortsGotten) {
  chrome.serial.getPorts(onPortsGotten)
}
openPort = function (port, bitrate, onPortOpened) {
  chrome.serial.open(port, {bitrate:bitrate}, onPortOpened)
}
closePort = function (connectionId, onPortClosed) {
  chrome.serial.close(connectionId, onPortClosed)
} 
writePort = function (connectionId, command, onPortwritten) {
  chrome.serial.write(connectionId, str2ab(command+'\r'), onPortwritten)
}
onCharRead = function (readInfo) {
  if (readInfo && readInfo.bytesRead > 0 && readInfo.data) {
    readListener(readInfo)
  }
  if (connectionId>=0) {
    setTimeout(function () {
      chrome.serial.read(connectionId, 100, onCharRead);
    },100)
  }
}
startListening = function (callback) {
    readListener = callback
    onCharRead()
}
str2ab = function(str) {
  var buf=new ArrayBuffer(str.length);
  var bufView=new Uint8Array(buf);
  for (var i=0; i<str.length; i++) {
    bufView[i]=str.charCodeAt(i);
  }
  return buf;
}

strLen = function (str) {
  var n=0, L=str.split(''), i
  for (i=0; i<L.length; i++) {
    n++; if (L[i]>127) n++
  }
  return n
}

strToUtf8 = function (string) {
  string = string.replace(/\r\n/g,"\n")
  var utf8Arr = [], i=0, c
  while (i < string.length) {
    c = string.charCodeAt(i++)
    if (c < 128) {
        utf8Arr.push(String.fromCharCode(c))
    } else if((c > 127) && (c < 2048)) {
        utf8Arr.push(String.fromCharCode((c >> 6) | 192))
        utf8Arr.push(String.fromCharCode((c & 63) | 128))
    }
    else {
        utf8Arr.push(String.fromCharCode((c >> 12) | 224))
        utf8Arr.push(String.fromCharCode(((c >> 6) & 63) | 128))
        utf8Arr.push(String.fromCharCode((c & 63) | 128))
    }
  }
  var buf = new ArrayBuffer(utf8Arr.length)
  var bufView = new Uint8Array(buf)
  for (i=0; i < string.length; i++) {
    bufView[i]=utf8Arr[i]
  }
  return buf;
}

utf8ToStr = function (utf8Arr) {
  var string = "", i = 0, c
  while (i < utf8Arr.length) {
    c = utf8Arr[i++]
    if (c>=128) {
      c = (c<<6) | (utf8Arr[i++]&63)
      if (c<=191 || c>=224) {
        c = (c<<6) | (utf8Arr[i++]&63)
      }
    }
    string += String.fromCharCode(c)
  }
  return string;
}


