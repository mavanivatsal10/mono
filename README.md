count num lines in /src folder, not including index.css file and /src/components/ui/* files:

find . -path "*/src/*" -type f \
  ! -path "*/src/components/ui/*" \
  ! -name "index.css" \
  -exec cat {} + | wc -l
