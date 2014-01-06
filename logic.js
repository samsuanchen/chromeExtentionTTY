// logic.js 20140103 sam & yap

/////////////////////////////////////////////////////////////////////
connectionId= -1
readListener= undefined
textRead    = ''
textTmp		= ''
ioLog 		= []
dataReadBuf = []
command		= undefined
commands	= []
CR 			= 13
LF 			= 10
actions 	= ['connect','disconn']
ok 			= ''
okp			= ''
okr			= ''
/////////////////////////////////////////////////////////////////////
showConnection = function(id) { var flag, iact
	e_cid.innerHTML = connectionId = id
	e_command.disabled = e_send.disabled = flag = id<0
	iact = flag?0:1
	e_console.innerHTML += e_console.innerHTML ? '\r\n' : ''
	e_console.innerHTML += '<sys>'+actions[1-iact]+' '+
		new Date().toISOString().split(/T|\..+/g).join(' ')+'</sys>'
	e_outputs.scrollTop = e_outputs.scrollHeight
	if (flag) {
		e_cid.classList.add('red')
		e_action.innerHTML = 'start'
	} else {
		e_cid.classList.remove('red')
		e_action.innerHTML = 'stop'
	}
	e_button.value = actions[iact]
}
consoleLog = function () {
	text = e_tmp.innerHTML.replace(/[\x06\n]/g,'')
	if (text.length===0) return
//	if (ioLog.length && text.length==0 && ioLog[ioLog.length-1].length===0) return
	e_tmp.innerHTML=''
	if (command===text) {
		text='<cmd>'+text+'</cmd>'
	}
	else if (ok) {
		text=text.replace(okp,okr)
	}
	e_console.innerHTML += '<br>'+ text
	e_outputs.scrollTop = e_outputs.scrollHeight
	ioLog.push(text)
	console.log(text)
	dataReadBuf = []
}
/////////////////////////////////////////////////////////////////////
onPortsGotten = function (ports){
    ports.forEach(function (port) {
    	var e_portOption = document.createElement('option')
        e_portOption.value = e_portOption.innerText = port
        e_portPicker.appendChild(e_portOption)
    })
}
onPortClosed = function () {
	showConnection(-1)
}
onFirstCmdOutput = function () { var t
	ok = ioLog[ioLog.length-1]
	okp= RegExp(ok+'$')
	okr= '<ok>'+ok+'</ok>'
	e_console.innerHTML=e_console.innerHTML.replace(okp,okr)
}
onPortOpened = function(data) {
	showConnection(data.connectionId)
	startListening(onPortRead)
	setTimeout(function(){
		writePort(connectionId, '', function() {
			setTimeout(onFirstCmdOutput,1000)
		})
	},6000)
}
onPortWritten = function (result) {
	console.log(command.length+'-byte command line written to '+e_port.value)
}
onPortRead = function (buf) {
	var u = new Uint8Array(buf.data)
	for (var i = 0; i < u.length; i++) {
		var b = u[i]
		if (b === LF) {
			consoleLog()
		} else {
			dataReadBuf.push(b) 
			e_tmp.innerHTML = textRead = utf8ToStr(dataReadBuf)
			if (strLen(textRead)>75) {
				consoleLog()
				dataReadBuf = dataReadBuf.slice(dataReadBuf.length-1)
				e_tmp.innerHTML = textRead = utf8ToStr(dataReadBuf)
			}
		}
	}
}
/////////////////////////////////////////////////////////////////////
onButtonClick = function (e) {
	if (e.target.value === 'connect')
		openPort(e_port.value, parseInt(e_bitrate.value), onPortOpened)
	else
		closePort(connectionId, onPortClosed)
}
onPortChange = function (e) {
    if (connectionId >= 0) {
        closePort(connectionId, onPortClosed)
    }
    e_port.value = e.target.value
    openPort(e_port.value, parseInt(e_bitrate.value), onPortOpened)
}
onCmdChange = function (e) {
	e_bytes.innerHTML=strLen(e.target.value)
}
onKeyDown = function (e) {
	if (e.keyCode===CR) {
		onSendClick()
		return
	}
	onCmdChange(e)
}
onSendClick = function () {
	command = e_command.value.trim()
	writePort(connectionId, command, onPortWritten)
}
onabort = function(e) {
	if (connectionId>=0)
		closePort(connectionId, onPortClosed)
}
onload = function(e) {
//-----------------------------------------------------------------//
	debugger
//-----------------------------------------------------------------//
	e_body		= e.target.children[0].children[1]
	e_outputs	= document.getElementById('outputs'		)
	e_console	= document.getElementById('console'		)
	e_tmp	 	= document.getElementById('tmp'			)
	e_command	= document.getElementById('command'		)
	e_command   .disabled = true
	e_command   .onchange = onCmdChange
	e_command   .onkeydown= onKeyDown
	e_send		= document.getElementById('send'		)
	e_send		.disabled = true
	e_send      .onclick  = onSendClick
	e_bitrate	= document.getElementById('bitrate'		)
	e_port	 	= document.getElementById('port'		)
	e_portPicker= document.getElementById('port-picker'	)
	e_portPicker.onchange = onPortChange
	e_button 	= document.getElementById('button'		)
	e_button    .onclick  = onButtonClick
	e_bytes		= document.getElementById('bytes'		)
	e_action	= document.getElementById('action'		)
	e_cid 		= document.getElementById('cid'			)
//-----------------------------------------------------------------//
	getPorts(onPortsGotten)
//-----------------------------------------------------------------//
}
/////////////////////////////////////////////////////////////////////