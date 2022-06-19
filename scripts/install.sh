
#!/bin/bash

BIN_INSTALL_LOC=/usr/bin
FOLDER_LOC=/var/ssh-bm

deno task compile
cp dist/ssh-bm $BIN_INSTALL_LOC/ssh-bm
sudo chmod u+x $BIN_INSTALL_LOC/ssh-bm