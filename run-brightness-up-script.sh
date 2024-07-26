# channel  2   control-change     5    57
chanel=$2
knob=$4
value=$5
# percent="$((value * 100 / 127))"
# decimal=`echo "print($value / 127)" | python3`

# echo "----------------------"
# echo "args: $@"
# echo "chanel: $chanel"
# echo "knob: $knob"
# echo "value: $value"
# echo "percent: $percent"
# echo "decimal: $decimal"

if [[ "$knob" == 7 ]]; then
  # echo "DOWN"
  osascript brightness-down.scpt
elif [[ "$knob" == 8 ]]; then
  # echo "UP"
  osascript brightness-up.scpt
fi


