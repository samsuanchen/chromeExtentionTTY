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
iCommand	= -1
k_CR 		= 13
k_LF 		= 10
k_UP		= 38
k_DOWN		= 40
actions 	= ['connect','disconn']
ok 			= ''
okp			= ''
okr			= ''

// ACTIONS //////////////////////////////////////////////////////////
// A1 ------------------------------------------------------------ //
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
// A2 ------------------------------------------------------------ //
logHistory = function () {
	text = e_tmp.innerHTML.replace(/[\x06\n]/g,'')
	if (text.length===0) return
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

// CALLBACKS ////////////////////////////////////////////////////////
// C1 ------------------------------------------------------------ //
onPortsGotten = function (ports){
    ports.forEach(function (port) {
    	var e_portOption = document.createElement('option')
        e_portOption.value = e_portOption.innerText = port
        e_portPicker.appendChild(e_portOption)
    })
}
// C2 ------------------------------------------------------------ //
onPortOpened = function(data) {
	showConnection(data.connectionId)
	startListening(onPortRead)
	setTimeout(function(){
		writePort(connectionId, '', function() {
			setTimeout(onFirstCmdOutput,1000)
		})
	},6000)
}
// C3 ------------------------------------------------------------ //
onPortRead = function (buf) {
	var u = new Uint8Array(buf.data)
	for (var i = 0; i < u.length; i++) {
		var b = u[i]
		if (b === k_LF) {
			logHistory()
		} else {
			dataReadBuf.push(b) 
			e_tmp.innerHTML = textRead = utf8ToStr(dataReadBuf)
			if (strLen(textRead)>75) {
				logHistory()
				dataReadBuf = dataReadBuf.slice(dataReadBuf.length-1)
				e_tmp.innerHTML = textRead = utf8ToStr(dataReadBuf)
			}
		}
	}
}
// C4 ------------------------------------------------------------ //
onPortWritten = function (result) {
	console.log(command.length+'-byte command line written to '+e_port.value)
}
// C5 ------------------------------------------------------------ //
onFirstCmdOutput = function () {
	ok = ioLog[ioLog.length-1]
	okp= RegExp(ok+'$')
	okr= '<ok>'+ok+'</ok>'
	e_console.innerHTML=e_console.innerHTML.replace(okp,okr)
}
// C6 ------------------------------------------------------------ //
onPortClosed = function () {
	showConnection(-1)
}

// EVENTS ///////////////////////////////////////////////////////////
// E1 ------------------------------------------------------------ //
onButtonClick = function (e) { // the connect or disconn button
	if (e.target.value === 'connect')
		openPort(e_port.value, parseInt(e_bitrate.value), onPortOpened)
	else
		closePort(connectionId, onPortClosed)
}
// E2 ------------------------------------------------------------ //
onPortChange = function (e) { // enter port name, for example: COM5
    if (connectionId >= 0) {
        closePort(connectionId, onPortClosed)
    }
    e_port.value = e.target.value
    openPort(e_port.value, parseInt(e_bitrate.value), onPortOpened)
}
// E3 ------------------------------------------------------------ //
onCmdChange = function () {
	e_bytes.innerHTML=strLen(e_command.value)
}
// E4 ------------------------------------------------------------ //
onKeyDown = function (e) { var k=e.keyCode, cmd
	if (k===k_CR) {
		onSendClick()
		return
	} else if (commands.length && k===k_UP) { // get previous command line
		if (iCommand<0) {
			command=e_command.value
			iCommand=commands.length-1 // start with the last
			cmd=commands[iCommand]
		} else if (!iCommand--) {
			cmd=command // if already the first
		} else {
			cmd=commands[iCommand]
		}
		e_command.value=cmd
	} else if (commands.length && k===k_DOWN) { // next command line
		if (iCommand<0) {
			command=e_command.value
			iCommand=0 // start with the first
			cmd=commands[iCommand]
		} else if (iCommand===commands.length-1) {
			iCommand=-1
			cmd=command // if already the last
		} else {
			cmd=commands[++iCommand]
		}
		e_command.value=cmd
	}
}
onKeyUp = function (e) {
	if (iCommand>=0) {
		commands[iCommand]=e_command.value
	}
	onCmdChange()
}
// E5 ------------------------------------------------------------ //
onSendClick = function () {
	command = e_command.value.trim()
	if (commands.indexOf(command)<0) {
		commands.push(command)
	}
	writePort(connectionId, command, onPortWritten)
	iCommand = -1
	e_command.value = ''
}
// E6 ------------------------------------------------------------ //
onclose = function(e) {
	if (connectionId>=0)
		closePort(connectionId, onPortClosed)
}
// E7 ------------------------------------------------------------ //
onload = function(e) {
//-----------------------------------------------------------------//
  debugger // To set BreakPoints --> right-click, 檢查元素, source //
//-----------------------------------------------------------------//
	e_body		= e.target.children[0].children[1]
	e_outputs	= document.getElementById('outputs'		)
	e_console	= document.getElementById('console'		)
	e_tmp	 	= document.getElementById('tmp'			)
	e_command	= document.getElementById('command'		)
	e_command   . disabled= true
	e_command   . onchange= onCmdChange
	e_command   .onkeydown= onKeyDown
	e_command   . onup 	  = onKeyUp
	e_send		= document.getElementById('send'		)
	e_send		. disabled= true
	e_send      . onclick = onSendClick
	e_bitrate	= document.getElementById('bitrate'		)
	e_port	 	= document.getElementById('port'		)
	e_portPicker= document.getElementById('port-picker'	)
	e_portPicker.onchange = onPortChange
	e_button 	= document.getElementById('button'		)
	e_button    . onclick = onButtonClick
	e_bytes		= document.getElementById('bytes'		)
	e_action	= document.getElementById('action'		)
	e_cid 		= document.getElementById('cid'			)
	getPorts(onPortsGotten)
}
/////////////////////////////////////////////////////////////////////