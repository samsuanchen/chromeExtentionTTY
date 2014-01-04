// logic.js 20140103 sam & yap

/////////////////////////////////////////////////////////////////////
connectionId = -1
readListener = undefined
textRead     = ''
textTmp		 = ''
consoleLog   = []
dataReadBuf  = []
dataTempBuf	 = []
lastCommand	 = undefined
CR 			 = 13
LF 			 = 10
/////////////////////////////////////////////////////////////////////
openPort = function () {
	var port = e_port.value
	var bitrate = {bitrate:parseInt(e_bitrate.value)}
	chrome.serial.open(port, bitrate, onPortOpen)
}
/////////////////////////////////////////////////////////////////////
onPortWrite = function (result) {
	console.log('last command of '+
		lastCommand.length+
		' bytes written to '+
		e_port.value)
}
onPortRead = function (buf) {
	var u = new Uint8Array(buf.data)
	for (var i = 0; i < u.length; i++) {
		var b = u[i]
		if (b === LF) {
			e_console.innerHTML += '<br>'+e_tmp.innerHTML
			e_outputs.scrollTop = e_outputs.scrollHeight
			consoleLog.push(textRead)
			console.log(textRead)
			dataReadBuf = []
		} else {
			dataReadBuf.push(b) 
			textRead = utf8ToStr(dataReadBuf)
			if (strLen(textRead)>75) {
				e_console.innerHTML += '<br>'+e_tmp.innerHTML
				e_outputs.scrollTop = e_outputs.scrollHeight
				window.scrollTo(e_console.top,e_console.scrollHeight)
				console.log(e_tmp.innerHTML)
				dataReadBuf = dataReadBuf.slice(dataReadBuf.length-1)
				textRead = utf8ToStr(dataReadBuf)
				e_tmp.innerHTML=''
			}
			e_tmp.innerHTML = textRead
		}
	}
}
onPortOpen = function(data) {
	connectionId = data.connectionId
	if (connectionId<0) return
	e_button.value = 'disconnect'
	e_status.innerHTML = 'connection Id ' + connectionId
	e_console.innerHTML += new Date().toISOString().split(/T|\..+/g).join(' ')
	console.log(data)
	startListening(onPortRead)
}
/////////////////////////////////////////////////////////////////////
onButtonClick = function (e) {
	if (e.target.value === 'connect') {
		openPort()
	} else {
		chrome.serial.close(connectionId, function (result) {
			console.log('disconnected')
		})
		connectionId = -1
		e_status.innerHTML = 'connection Id ' + connectionId
		e_button.value = 'connect'
	}
}
onPortChange = function (e) {
    if (connectionId >= 0) {
        closeSerial(onClose)
        return
    }
    e_port.value = e.target.value
    openPort()
}
onKeyDown = function (e) {
	if (e.keyCode===CR) {
		onSendClick()
	}
}
onSendClick = function () {
	lastCommand = e_command.value.trim()
	chrome.serial.write(connectionId, str2ab(lastCommand+'\r'), onPortWrite)
}
onload = function(e) {
//-----------------------------------------------------------------//
	debugger
//-----------------------------------------------------------------//
	e_port	 	= document.getElementById('port'		)
	e_bitrate	= document.getElementById('bitrate'		)
	e_status 	= document.getElementById('status'		)
	e_button 	= document.getElementById('button'		)
	e_button    .onclick  = onButtonClick
	e_outputs	= document.getElementById('outputs'		)
	e_console	= document.getElementById('console'		)
	e_tmp	 	= document.getElementById('tmp'			)
	e_portPicker= document.getElementById('port-picker'	)
	e_portPicker.onchange = onPortChange
	e_command	= document.getElementById('command'		)
	e_command   .onkeydown= onKeyDown
	e_send		= document.getElementById('send'		)
	e_send      .onclick  = onSendClick
	e_bytes		= document.getElementById('bytes'		)
	e_body		= e.target.children[0].children[1]
//-----------------------------------------------------------------//
	chrome.serial.getPorts(function (ports){
	    ports.forEach(function (port) {
	    	var e_portOption = document.createElement('option')
	        e_portOption.value = e_portOption.innerText = port
	        e_portPicker.appendChild(e_portOption)
	    })
	})
//-----------------------------------------------------------------//
}
/////////////////////////////////////////////////////////////////////