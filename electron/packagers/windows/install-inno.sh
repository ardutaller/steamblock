# Look for InnoSetup in the wine folder, otherwise try to install it if envvar $tools is set
isccpath=`find ~/.wine/drive_c | grep ISCC.exe`
if [ -z "$isccpath" ]; then
	echo "Could not find an InnoSetup installation."
	echo "Will try to install it now."
	if command -v wine; then
		mkdir innosetup
		cd innosetup
		wget http://files.jrsoftware.org/ispack/ispack-5.2.3.exe
		wine ./ispack-5.2.3.exe
		cd ..
		rm -rf innosetup
		isccpath=`find ~/.wine/drive_c | grep ISCC.exe`
		if [ -z "$isccpath" ]; then
			echo "Inno Setup installation seems to have failed."
			exit 1
		else
			echo "Inno Setup installed successfully."
		fi
	else
		echo "Wine is not installed in this system."
		echo "Wine is a prerequisite for installing Inno Setup. Please get it from your distro package manager, or head to https://www.winehq.org/download"
		exit 1
	fi
fi
