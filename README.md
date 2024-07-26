This turns brings the screen brightness up one notch and it shows the system icon and
works with Lunar

```bash
osascript -e 'tell application "System Events"' -e 'key code 107' -e ' end tell'
```

This decreases the brightness

```bash
osascript -e 'tell application "System Events"' -e 'key code 113' -e ' end tell'
```

This can be done in AppleScript

```applescript
tell application "System Events"
	key down option
	key down shift
	key code 107
	key up shift
	key up option
end tell
```

AppleScript can't subscribe to events, so the whole thing must be done in Swift.

https://developer.apple.com/tutorials/swiftui/creating-a-macos-app

MIDI in Swift

https://itnext.io/midi-listener-in-swift-b6e5fb277406
https://stackoverflow.com/questions/27416435/send-and-receive-midi-with-swift-and-coremidi





