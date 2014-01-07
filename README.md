chrome Extention TTY
====================

Install github and clone this project from the following address:
https://github.com/samsuanchen/chromeExtentionTTY

Through a serial communication port, this APP is used to talk with 
our 328eforth (burned onto the flash memory) on the Atmega328p cpu 
chip of an Arduino UNO board

From my Window 7, before connecting to the chip, the 
**baudrate** and **port** should be given correctly. (The
**port** could be picked among available options)

The console log shows communication messages in colors:
system:red, inputCommand:blue, ok:green, outputMessage:black

Using the keys UP and DOWN, any previous command can be reentered 

We can right-click, 檢查元素, source, set BreakPoints to debug
