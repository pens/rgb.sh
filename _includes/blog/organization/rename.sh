#!/usr/bin/env sh
exiftool -ee -r -d '%Y/%m/%y%m%d_%H%M%S%%+c.%%e' '-filename<$filemodifydate' '-filename<$createdate' '-filename<$datetimeoriginal' .
