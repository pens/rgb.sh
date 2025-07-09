#!/usr/bin/env bash

for gv in *.gv; do
    dot $gv -Tsvg -o ${gv%.gv}.svg
done