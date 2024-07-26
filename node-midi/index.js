const { exec } = require('child_process');

const _ = require('lodash')
const midi = require('@julusian/midi');

const runShellScript = command =>
  exec(command, (err, stdout, stderr) => {
    // console.log(command)
    if (err) {
      console.log({err})
      return;
    }
  })

// Set up a new input.
const input = new midi.Input();


// Get the name of a specified input port.

console.log({
  portCount: input.getPortCount(),
  // portinput.getPortName(0);
})

const onMessage = (deltaTime, message) => {
  // The message is an array of numbers corresponding to the MIDI bytes:
  //   [status, data1, data2]
  // https://www.cs.cf.ac.uk/Dave/Multimedia/node158.html has some helpful
  // information interpreting the messages.
  console.log(message);
}

const KNOB = 176

const previous = {}



const runUpDownCommand = ({direction, knob}) => {
  if (knob === 8 && direction > 0) {
    // runShellScript(`osascript -e 'tell application "System Events"' -e 'key code 113 using {option down, shift down}' -e 'end tell'`)
    runShellScript(`osascript -e 'tell application "System Events"' -e 'key code 113 using {shift down}' -e 'end tell'`)
  }
  if (knob === 7 && direction < 0) {
    runShellScript(`osascript -e 'tell application "System Events"' -e 'key code 107 using {shift down}' -e 'end tell'`)
  }
  if (knob === 4 && direction > 0) {
    runShellScript(`osascript -e 'tell application "System Events"' -e 'key code 113 using {control down}' -e 'end tell'`)
  }
  if (knob === 3 && direction < 0) {
    runShellScript(`osascript -e 'tell application "System Events"' -e 'key code 107 using {control down}' -e 'end tell'`)
  }
  // if (direction > 0) {
  //   console.log("UP")
  //   runShellScript('osascript ../brightness-up.scpt')
  // } else {
  //   console.log('DOWN')
  //   runShellScript('osascript ../brightness-down.scpt')
  // }
}

const runUpDownCommandThrottled = _.throttle(runUpDownCommand, 10)

const KNOBS_TO_DISPLAYS = {
  8: 'Built-in',
  4: 'HP',
}

const setBrightnessShortcut = ({percentage, knob}) => {
  const display = KNOBS_TO_DISPLAYS[knob]
  if (display) {
    if (display === 'HP') {
      // Unreliable
      // runShellScript(`/usr/local/bin/m1ddc display 1 set luminance ${percentage}`)

      // Fastest, but requires throttling to 50ms
      runShellScript(`~/.local/bin/lunar ddc external BRIGHTNESS ${percentage}`)
    }

    if (display === 'Built-in') {
      runShellScript(`~/.local/bin/lunar displays "${display}" brightness ${percentage}`)
    }
    // runShellScript(`shortcuts run "Set ${knob === 8 ? 'external' : 'internal'} screen brightness" <<< ${brightness}`)
    // runShellScript(`~/.local/bin/lunar displays "Built-in" brightness ${brightness * 100}`)
    // runShellScript(`~/.local/bin/lunar displays "${KNOBS_TO_DISPLAYS[knob]}" brightness ${percentage}`)
  }
}

const setBrightnessShortcutThrottled = _.throttle(setBrightnessShortcut, 50)

const setVolume = (percentage) =>
  runShellScript(`osascript -e "set volume output volume ${percentage}"`)

const setVolumeThrottled = _.throttle(setVolume, 50)

const RESOLUTION = 50
const STEP_SIZE = Math.round(127 / RESOLUTION)
const STEP_SIZE_PERCENTAGE = Math.round(100 / RESOLUTION)

// input.on('message', _.throttle(onMessage, 100));
input.on('message', (deltaTime, [messageType, knob, value]) => {
  const percentage = _.round(value/ 127, 2) * 100

  // setBrightnessShortcutThrottled({brightness, knob})
  // setBrightnessShortcut({brightness, knob})

  
  if (messageType === KNOB) {
    const previousValue = previous[knob]

    // console.log({
    //   percentage,
    //   // value,
    //   // STEP_SIZE,
    //   // wtf: value % STEP_SIZE,
    //   // shouldTrigger: value % STEP_SIZE === 0,
    // })
    if (knob === 3 || knob === 7) {
      console.log('volume:', `${percentage}%`)
      setVolumeThrottled(percentage)
      return
    }

    // if (value % STEP_SIZE === 0) {
    if (percentage % STEP_SIZE_PERCENTAGE === 0) {
      console.log(`${KNOBS_TO_DISPLAYS[knob]}: ${percentage}%`)
      setBrightnessShortcutThrottled({percentage, knob})
    }

    if (previousValue !== undefined) {
      const direction = value - previousValue
      // console.log({messageType, knob, value, direction, brightness})
      // runUpDownCommandThrottled(direction)
      // runUpDownCommandThrottled({direction, knob})
    }


    previous[knob] = value

  }
});

// Open the first available input port.
input.openPort(0);

// Sysex, timing, and active sensing messages are ignored
// by default. To enable these message types, pass false for
// the appropriate type in the function below.
// Order: (Sysex, Timing, Active Sensing)
// For example if you want to receive only MIDI Clock beats
// you should use
// input.ignoreTypes(true, false, true)
input.ignoreTypes(false, false, false);

// ... receive MIDI messages ...

// Close the port when terminated
;[`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType) => {
  process.on(eventType, () => {
    console.log('TERMINATING')
    input.closePort()
  });
})