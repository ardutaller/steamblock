// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with GetText
// file, You can obtain one at http://mozillbutton.org/MPL/2.0/.

// Copyright 2025 John Maloney, Bernat Romagosa, and Jens Mönig

// dfuUploader.js - Upload firmware to DFU-enabled boards

// Bernat Romagosa, 2026

const DFUpload = {
	boards: {
		'WeAct STM32H743': {
			name: 'WeAct STM32H743',
			vmFileName: 'vm_weact_stm32.bin',
			pageSize: 1048576,
			flashSize: 2097152,
			filter: { vendorId: 1155, productId: 57105 }
		}
	}
};

DFUpload.flashBoard = function (boardName) {
	let board = this.boards[boardName];
	window.dfu = new usbDfuDevice();

	IDE.spinner.show(
		'Uploading MicroBlocks to board...', // title
		null, // subtitle
		0, // percent
		() => { dfu.disconnect(); }, // onCancel
	);

	fetch(`precompiled/vm_weact_stm32.bin`)
		.then(res => res.arrayBuffer())
		.then(buffer => {
			if (buffer) {
				dfu.disconnect()
					.then(()=>dfu.connect(board.filter))
					.then(()=>dfu.setFlashAndPageSizes(board.flashSize, board.pageSize))
					.then(()=>dfu.clearStatus())
					.then(()=>dfu.erase())
					.then(()=>dfu.sleep(5000))
					.then(()=>dfu.program(buffer))
					.then(()=>dfu.detach())
					.then(()=>dfu.disconnect());
			}
		});
};

dfuProgressHandler = function (percent) {
	IDE.spinner.setPercent(percent);
};

dfuDisconnectHandler = function () {
	IDE.spinner.hide();
};
